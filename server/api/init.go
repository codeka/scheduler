package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type InitResponse struct {
	User *User `json:"user"`
}

// HandleInit handles requests for /_/init which is the first request any client must call. We'll check that they have
// a valid logic and do some initial bookkeeping.
func HandleInit(c *gin.Context) {
	var resp = InitResponse{}

	user, _ := LoadUser(c)
	if user != nil {
		resp.User = user
	}

	c.JSON(http.StatusOK, resp)
}
