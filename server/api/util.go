package api

import (
	"net/http"
	"strings"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware is our gin middleware for extracting the auth information from the request.
func AuthMiddleware(c *gin.Context) {
	auth := c.Request.Header["Authorization"]
	if len(auth) > 0 && strings.HasPrefix(auth[0], "Bearer ") {
		secretKey := strings.TrimPrefix(auth[0], "Bearer ")
		user, err := store.GetUserBySecret(secretKey)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		if user == nil {
			c.Status(http.StatusUnauthorized)
			return
		}
		c.Set("user", user)

		roles, err := store.GetUserRoles(user.ID)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.Set("roles", roles)
	}

	c.Next()
}

// Returns true if the currently authenticated user is in the given role or not.
func IsInRole(c *gin.Context, role string) bool {
	val, ok := c.Get("roles")
	if !ok {
		return false
	}

	roles, ok := val.([]string)
	if !ok {
		return false
	}

	for _, r := range roles {
		if strings.ToLower(role) == strings.ToLower(r) {
			return true
		}
	}
	return false
}

func IsInGroup(c *gin.Context, groupID int64) bool {
	var groups []int64
	val, ok := c.Get("groups")
	if ok {
		groups, ok = val.([]int64)
	}
	if !ok { // Note: this could have been set to value by the cast as well, hence need to check again.
		user := GetUser(c)
		if user == nil {
			return false
		}

		groups, err := store.GetUserGroups(user.ID)
		if err != nil {
			return false
		}

		c.Set("groups", groups)
	}

	for _, group := range groups {
		if group == groupID {
			return true
		}
	}
	return false
}

// GetUser returns the authenticated user, or nil if not authenticated.
func GetUser(c *gin.Context) *store.User {
	val, ok := c.Get("user")
	if !ok {
		return nil
	}

	user, ok := val.(*store.User)
	if !ok {
		return nil
	}

	return user
}

func setupUtil(g *gin.Engine) error {
	g.Use(AuthMiddleware)

	return nil
}
