package api

import (
	"net/http"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

type usersResponse struct {
	Users []*User `json:"users"`
}

func HandleAdminUsersGet(c *gin.Context) {
	resp := usersResponse{}

	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	users, err := store.GetUsers()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	userRoles, err := store.GetAllUserRoles()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	for _, u := range users {
		user := MakeUser(u, userRoles[u.ID])
		resp.Users = append(resp.Users, user)
	}

	c.JSON(http.StatusOK, resp)
}

func setupAdmin(g *gin.Engine) error {
	g.GET("_/admin/users", HandleAdminUsersGet)

	return nil
}
