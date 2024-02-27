package api

import (
	"net/http"
	"strconv"
	"time"

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

// HandleEventsGet handles requests to /_/events. It returns the events in the data store, filtered by various query
// parameters, including:
// ?dateFrom={}&dateTo={} - between the given date ranges
func HandleEventsGet(c *gin.Context) {
	resp := EventsResponse{}

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
		for _, s := range shifts {
			resp.Shifts = append(resp.Shifts, MakeShift(s))
		}
	}

	c.JSON(http.StatusOK, resp)
}

// HandleEventsPosts handles POST requests to /_/events. We save the event you've posted to the data store.
func HandleEventsPost(c *gin.Context) {
	var e Event
	if err := c.BindJSON(&e); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	event, err := EventToStore(&e)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := store.SaveEvent(event); err != nil {
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

	if err := store.SaveShift(shift); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

// HandleShiftsEligibleUsersGet returns all the users that are eligible for a given shift. But only if the authenticated
// user is a SHIFT_MANAGER.
func HandleShiftsEligibleUsersGet(c *gin.Context) {
	//if !IsInRole(c, "ADMIN") && !IsInRole(c, "SHIFT_MANAGER") {
	//		c.AbortWithStatus(http.StatusUnauthorized)
	//		return
	//	}

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

	c.JSON(http.StatusOK, resp)
}

func setupEvents(g *gin.Engine) error {
	g.GET("_/events", HandleEventsGet)
	g.POST("_/events", HandleEventsPost)

	g.POST("_/shifts", HandleShiftsPost)
	g.GET("_/shifts/:id/eligible-users", HandleShiftsEligibleUsersGet)

	return nil
}
