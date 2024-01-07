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

	// TODO: check if they have a cookie, and if they do, try to load the user.

	c.IndentedJSON(http.StatusOK, resp)
}
