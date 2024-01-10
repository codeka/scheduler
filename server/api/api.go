package api

import (
	"fmt"
	"strings"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

// LoadUser loads up the user for the given request, or returns nil if no secret key is give,
func LoadUser(c *gin.Context) (*User, error) {
	secretKey := c.Request.Header.Get("Authorization")
	secretKey, found := strings.CutPrefix(secretKey, "Bearer ")
	if !found {
		return nil, fmt.Errorf("not logged in")
	}

	// TODO: cache users?
	user, err := store.GetUserBySecret(secretKey)
	if err != nil {
		return nil, err
	}

	// TODO: load up roles, groups, etc.
	return MakeUser(user), nil
}

func Setup(g *gin.Engine) error {
	g.GET("_/init", HandleInit)
	if err := setupAuth(g); err != nil {
		return err
	}
	if err := setupEvents(g); err != nil {
		return err
	}

	return nil
}
