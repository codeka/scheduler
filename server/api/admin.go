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

func HandleAdminUsersPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var u User
	if err := c.BindJSON(&u); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	user := UserToStore(&u)

	if err := store.SaveUser(user); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// TODO: should all this be in a transaction so that we don't update the user in case
	// saving their roles somehow fails?
	if err := store.UpdateUserRoles(user.ID, u.Roles); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func setupAdmin(g *gin.Engine) error {
	g.GET("_/admin/users", HandleAdminUsersGet)
	g.POST("_/admin/users", HandleAdminUsersPost)

	return nil
}
