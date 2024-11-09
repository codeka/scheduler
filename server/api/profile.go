package api

import (
	"net/http"

	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
	"github.com/gin-gonic/gin"
)

func HandleProfilePost(c *gin.Context) {
	var u User
	if err := c.BindJSON(&u); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	user := GetUser(c)
	if user == nil {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	user.Name = u.Name
	user.Email = u.Email
	user.Phone = u.Phone

	if err := store.SaveUser(user); err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleProfilePicturePost(c *gin.Context) {
	user := GetUser(c)
	if user == nil {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	file, err := c.FormFile("picture")
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	name, path, err := store.MakeImageFileName()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	err = c.SaveUploadedFile(file, path)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	user.PictureName = name
	err = store.SaveUser(user)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func setupProfile(g *gin.Engine) error {
	g.POST("_/profile", HandleProfilePost)
	g.POST("_/profile/picture", HandleProfilePicturePost)

	return nil
}
