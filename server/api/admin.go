package api

import (
	"net/http"
	"strconv"

	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
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
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	userRoles, err := store.GetAllUserRoles()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	userGroups, err := store.GetAllUserGroups()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	for _, u := range users {
		user := MakeUser(u, userRoles[u.ID], userGroups[u.ID])
		resp.Users = append(resp.Users, user)
	}

	c.JSON(http.StatusOK, resp)
}

func HandleAdminUserGet(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	userIdStr := c.Param("id")
	userId, err := strconv.ParseInt(userIdStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	u, err := store.GetUser(userId)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	if u == nil {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	roles, err := store.GetUserRoles(u.ID)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	groups, err := store.GetUserGroups(u.ID)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	user := MakeUser(u, roles, groups)
	c.JSON(http.StatusOK, user)
}

func HandleAdminUsersPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var u User
	if err := c.BindJSON(&u); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	user := UserToStore(&u)

	if err := store.SaveUser(user); err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	// TODO: should all this be in a transaction so that we don't update the user in case
	// saving their roles somehow fails?
	if err := store.UpdateUserRoles(user.ID, u.Roles); err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	if err := store.UpdateUserGroups(user.ID, u.Groups); err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func setupAdmin(g *gin.Engine) error {
	g.GET("_/admin/users", HandleAdminUsersGet)
	g.GET("_/admin/users/:id", HandleAdminUserGet)
	g.POST("_/admin/users", HandleAdminUsersPost)

	return nil
}
