package api

import (
	"net/http"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

type venue struct {
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Address   string `json:"address"`
}

type InitResponse struct {
	User  *User  `json:"user"`
	Venue *venue `json:"venue"`
}

// HandleInit handles requests for /_/init which is the first request any client must call. We'll check that they have
// a valid logic and do some initial bookkeeping.
func HandleInit(c *gin.Context) {
	var resp = InitResponse{}

	user, _ := LoadUser(c)
	if user != nil {
		resp.User = user
	}

	v, _ := store.GetVenue()
	if v != nil {
		resp.Venue = &venue{
			Name:      v.Name,
			ShortName: v.ShortName,
			Address:   v.Address,
		}
	}

	c.JSON(http.StatusOK, resp)
}
