package api

import (
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"

	"com.codeka/scheduler/server/notify"
	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
	"github.com/gin-gonic/gin"
)

type EventsResponse struct {
	Events []*Event `json:"events"`
	Shifts []*Shift `json:"shifts"`
}

type EligibleUsersResponse struct {
	Users []*User `json:"users"`
}

type SaveShiftRequest struct {
	Event         *Event   `json:"event"`
	InitialShifts []*Shift `json:"initialShifts"`
}

type ShiftSignupRequest struct {
	UserID *int64 `json:"userId"`
	Notes  *string
}

// HandleEventsGet handles requests to /_/events. It returns the events in the data store, filtered by various query
// parameters, including:
// ?dateFrom={}&dateTo={} - between the given date ranges
func HandleEventsGet(c *gin.Context) {
	resp := EventsResponse{}

	authUser := GetUser(c)

	if c.Query("startDate") != "" && c.Query("endDate") != "" {
		startDate, err := time.Parse(time.DateOnly, c.Query("startDate"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		endDate, err := time.Parse(time.DateOnly, c.Query("endDate"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		events, err := store.GetEventsInDateRange(startDate, endDate)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		for _, e := range events {
			resp.Events = append(resp.Events, MakeEvent(e))
		}

		shifts, err := store.GetShiftsInDateRange(startDate, endDate)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		var shiftIDs []int64
		for _, s := range shifts {
			shiftIDs = append(shiftIDs, s.ID)
		}
		allSignups, err := store.GetShiftUsers(shiftIDs...)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		// TODO: filter user to just the IDs we need, rather than fetching them all then filtering in code.
		allUsers, err := store.GetUsersMap()
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		for _, s := range shifts {
			var signups []*store.ShiftSignup
			for _, signup := range allSignups {
				if signup.ShiftID == s.ID {
					signups = append(signups, signup)
				}
			}

			resp.Shifts = append(resp.Shifts, MakeShift(s, signups, allUsers))
		}
	}

	for _, shift := range resp.Shifts {
		for _, signup := range shift.Signups {
			if authUser.ID != signup.User.ID {
				log.Printf("sanitizing user %s", signup.User.Email)
				SanitizeUser(signup.User)
				log.Printf("done sanitizing user %s", signup.User.Email)
			}
		}
	}

	c.JSON(http.StatusOK, resp)
}

// HandleEventsPosts handles POST requests to /_/events. We save the event you've posted to the data store.
func HandleEventsPost(c *gin.Context) {
	var req SaveShiftRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	event, err := EventToStore(req.Event)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := store.SaveEvent(event); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if req.InitialShifts != nil {
		for _, s := range req.InitialShifts {
			shift, err := ShiftToStore(s)
			if err != nil {
				c.AbortWithError(http.StatusBadRequest, err)
				return
			}

			err = store.SaveShift(shift)
			if err != nil {
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
		}
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleEventsDelete(c *gin.Context) {
	eventIdStr := c.Param("id")
	eventId, err := strconv.ParseInt(eventIdStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	if err := store.DeleteEvent(eventId); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleShiftsPost(c *gin.Context) {
	var s Shift
	if err := c.BindJSON(&s); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	shift, err := ShiftToStore(&s)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !CanManageGroup(c, shift.GroupID) {
		log.Printf("Cannot save shift that we cannot manage")
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if err := store.SaveShift(shift); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleShiftDelete(c *gin.Context) {
	shiftIDStr := c.Param("shiftID")
	shiftID, err := strconv.ParseInt(shiftIDStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	shift, err := store.GetShift(shiftID)
	if err != nil {
		util.HandleError(c, http.StatusNotFound, err)
		return
	}

	if !CanManageGroup(c, shift.GroupID) {
		log.Printf("Not ADMIN, or not SHIFT_MANAGER for this group, cannot delete shift.")
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if err := store.DeleteShift(shiftID); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

// HandleShiftsEligibleUsersGet returns all the users that are eligible for a given shift. But only if the authenticated
// user is a SHIFT_MANAGER.
func HandleShiftsEligibleUsersGet(c *gin.Context) {
	shiftIdStr := c.Param("id")
	shiftId, err := strconv.ParseInt(shiftIdStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	shift, err := store.GetShift(shiftId)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	query := c.Query("q")
	users, err := store.GetEligibleUsers(shift, query)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	resp := EligibleUsersResponse{}
	for _, u := range users {
		user := MakeUser(u, []string{}, []int64{}) // Don't fill in roles or groups for these users.
		resp.Users = append(resp.Users, user)
	}

	sort.Sort(byName(resp.Users))

	c.JSON(http.StatusOK, resp)
}

func HandleShiftsSignupPost(c *gin.Context) {
	shiftIdStr := c.Param("id")
	shiftId, err := strconv.ParseInt(shiftIdStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	shift, err := store.GetShift(shiftId)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	var req ShiftSignupRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	// authUser is the user we're currently authenticaed as.
	authUser := GetUser(c)
	if authUser == nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if req.UserID == nil || *req.UserID == 0 {
		req.UserID = &authUser.ID
	}
	userId := *req.UserID

	if !IsCurrentUser(c, userId) && !CanManageGroup(c, shift.GroupID) {
		log.Printf("signing up a different user, and not in ADMIN or SHIFT_MANAGER roles")
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Make sure the user we're adding to this shift is eligible for this shift.
	user, err := store.GetUser(userId)
	if err != nil {
		util.HandleError(c, http.StatusNotFound, err)
		return
	}
	userGroups, err := store.GetUserGroups(user.ID)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	isInGroup := false
	for _, groupID := range userGroups {
		if groupID == shift.GroupID {
			isInGroup = true
		}
	}
	if !isInGroup {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	// Finally, we're all good, add the user to this shift.
	var notes string
	if req.Notes == nil {
		notes = ""
	} else {
		notes = *req.Notes
	}
	store.SaveShiftUser(shift.ID, user.ID, notes)

	// And send them a notification that they've been signed up.
	err = notify.SendShiftSignupNotification(shift, user)
	if err != nil {
		// Just log, but we're essentially done anyway so don't cancel at this point
		log.Printf("error sending notification: %v", err)
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleShiftsSignupDelete(c *gin.Context) {
	shiftIDStr := c.Param("shiftID")
	shiftID, err := strconv.ParseInt(shiftIDStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	shift, err := store.GetShift(shiftID)
	if err != nil {
		util.HandleError(c, http.StatusNotFound, err)
		return
	}

	userIDStr := c.Param("userID")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	if !IsCurrentUser(c, userID) && !CanManageGroup(c, shift.GroupID) {
		log.Printf("Cannot delete shift signup for different user.")
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	store.DeleteShiftUser(shiftID, userID)
	c.AbortWithStatus(http.StatusOK)
}

func setupEvents(g *gin.Engine) error {
	g.GET("_/events", HandleEventsGet)
	g.POST("_/events", HandleEventsPost)
	g.DELETE("_/events/:id", HandleEventsDelete)

	g.POST("_/shifts", HandleShiftsPost)
	g.DELETE("_/shifts/:shiftID", HandleShiftDelete)
	g.GET("_/shifts/:id/eligible-users", HandleShiftsEligibleUsersGet)
	g.POST("_/shifts/:id/signups", HandleShiftsSignupPost)
	g.DELETE("_/shifts/:shiftID/signups/:userID", HandleShiftsSignupDelete)

	return nil
}
