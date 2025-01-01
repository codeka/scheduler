package api

import (
	"net/http"

	"com.codeka/scheduler/server/flags"
	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
	"github.com/gin-gonic/gin"
)

type InitResponse struct {
	User         *User          `json:"user"`
	Venue        *Venue         `json:"venue"`
	Groups       []*Group       `json:"groups"`
	FeatureFlags []*FeatureFlag `json:"featureFlags"`
}

// HandleInit handles requests for /_/init which is the first request any client must call. We'll check that they have
// a valid logic and do some initial bookkeeping.
func HandleInit(c *gin.Context) {
	var resp = InitResponse{}

	user := GetUser(c)
	if user != nil {
		roles, err := store.GetUserRoles(user.ID)
		if err != nil {
			util.HandleError(c, http.StatusInternalServerError, err)
			return
		}

		groups, err := store.GetUserGroups(user.ID)
		if err != nil {
			util.HandleError(c, http.StatusInternalServerError, err)
			return
		}

		resp.User = MakeUser(user, roles, groups)
	}

	v, err := store.GetVenue()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	if v != nil {
		resp.Venue = MakeVenue(v)
	}

	gs, err := store.GetGroups()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	for _, g := range gs {
		resp.Groups = append(resp.Groups, MakeGroup(g))
	}
	for name, flag := range flags.AllFlags {
		resp.FeatureFlags = append(resp.FeatureFlags, MakeFeatureFlag(name, flag))
	}

	c.JSON(http.StatusOK, resp)
}
