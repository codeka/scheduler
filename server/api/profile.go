package api

import (
	"net/http"

	"com.codeka/scheduler/server/notify"
	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
	"github.com/gin-gonic/gin"
)

type notificationSettingsRequest struct {
	NotificationSettings []NotificationSetting `json:"notificationSettings"`
}

type notificationSettingsResponse struct {
	NotificationSettings []*NotificationSetting `json:"notificationSettings"`
}

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

func HandleNotificationSettingsGet(c *gin.Context) {
	user := GetUser(c)
	if user == nil {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	settings, err := store.GetUserNotificationSettings(user.ID)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, notificationSettingsResponse{
		NotificationSettings: MakeNotificationSettings(settings),
	})
}

func HandleNotificationSettingsPost(c *gin.Context) {
	user := GetUser(c)
	if user == nil {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	var req notificationSettingsRequest
	if err := c.BindJSON(&req); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	settings := make(map[string]NotificationSetting)
	for _, s := range req.NotificationSettings {
		settings[s.NotificationID] = s
	}
	for _, n := range notify.NotificationTypes {
		setting, ok := settings[n.ID]
		if !ok {
			continue
		}

		store.SaveNotificationSetting(NotificationSettingToStore(user, setting))
	}

	c.AbortWithStatus(http.StatusOK)
}

func setupProfile(g *gin.Engine) error {
	g.POST("_/profile", HandleProfilePost)
	g.POST("_/profile/picture", HandleProfilePicturePost)
	g.GET("_/profile/notifications", HandleNotificationSettingsGet)
	g.POST("_/profile/notifications", HandleNotificationSettingsPost)

	return nil
}
