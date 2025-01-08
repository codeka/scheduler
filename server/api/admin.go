package api

import (
	"net/http"
	"sort"
	"strconv"
	"time"

	"com.codeka/scheduler/server/cron"
	"com.codeka/scheduler/server/flags"
	"com.codeka/scheduler/server/notify"
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

	sort.Sort(byName(resp.Users))

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

func HandleAdminUserDelete(c *gin.Context) {
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

	err = store.DeleteUser(userId)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
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

func HandleAdminUserPicturePost(c *gin.Context) {
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
	user, err := store.GetUser(userId)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	if user == nil {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	file, err := c.FormFile("picture")
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	name, path, err := store.MakeImageFileName("png")
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

func HandleAdminVenuePost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var v Venue
	if err := c.BindJSON(&v); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	venue := VenueToStore(&v)

	if err := store.SaveVenue(venue); err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminVenuePicturePost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	file, err := c.FormFile("picture")
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	name, path, err := store.MakeImageFileName("png")
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	err = c.SaveUploadedFile(file, path)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	venue, err := store.GetVenue()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	venue.PictureName = name
	err = store.SaveVenue(venue)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminVenueIcoPicturePost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	file, err := c.FormFile("picture")
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	name, path, err := store.MakeImageFileName("ico")
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	err = c.SaveUploadedFile(file, path)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	venue, err := store.GetVenue()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	venue.IcoPictureName = name
	err = store.SaveVenue(venue)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminVenueSvgPicturePost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	file, err := c.FormFile("picture")
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	name, path, err := store.MakeImageFileName("svg")
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	err = c.SaveUploadedFile(file, path)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	venue, err := store.GetVenue()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}
	venue.SvgPictureName = name
	err = store.SaveVenue(venue)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminGroupsPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var g Group
	if err := c.BindJSON(&g); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	group := GroupToStore(&g)
	err := store.SaveGroup(group)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

type cronJobsResponse struct {
	Jobs []CronJob `json:"jobs"`
}

func HandleAdminCronJobGet(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	jobs, err := store.LoadCrobJobs()
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	resp := cronJobsResponse{}
	for _, job := range jobs {
		resp.Jobs = append(resp.Jobs, MakeCronJob(*job))
	}

	c.JSON(http.StatusOK, resp)
}

func HandleAdminCronJobPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var j CronJob
	if err := c.BindJSON(&j); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	job := CronJobToStore(j)
	if err := cron.UpdateNextRun(&job); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	err := store.SaveCronJob(&job)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminCronJobDelete(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	cronJobIStr := c.Param("id")
	cronJobId, err := strconv.ParseInt(cronJobIStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	err = store.DeleteCronJob(cronJobId)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminCronJobRunPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	cronJobIStr := c.Param("id")
	cronJobId, err := strconv.ParseInt(cronJobIStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}

	job, err := store.LoadCrobJob(cronJobId)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	if err := cron.RunCronJob(c, time.Now(), job); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	err = store.SaveCronJob(job)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

type notificationTypesResponse struct {
	NotificationTypes []NotificationType `json:"notificationTypes"`
}

func HandleAdminNotificationTypesGet(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	notificationTypes := notify.GetNotificationTypes()
	resp := notificationTypesResponse{}
	for _, notificationType := range notificationTypes {
		resp.NotificationTypes = append(resp.NotificationTypes, MakeNotificationType(notificationType))
	}

	c.JSON(http.StatusOK, resp)
}

func HandleAdminNotificationTypesPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var nt NotificationType
	if err := c.BindJSON(&nt); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	notificationType := NotificationTypeToStore(nt)
	err := store.SaveNotificationType(notificationType)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	// Make sure we re-load the notification types.
	notify.EnsureNotificationTypes()

	c.AbortWithStatus(http.StatusOK)
}

func HandleAdminFeatureFlagsPost(c *gin.Context) {
	if !IsInRole(c, "ADMIN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var flag FeatureFlag
	if err := c.BindJSON(&flag); err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	err := flags.UpdateFlag(flag.FlagName, flag.Enabled, flag.Settings)
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}
func setupAdmin(g *gin.Engine) error {
	g.GET("_/admin/users", HandleAdminUsersGet)
	g.GET("_/admin/users/:id", HandleAdminUserGet)
	g.DELETE("_/admin/users/:id", HandleAdminUserDelete)
	g.POST("_/admin/users/:id/picture", HandleAdminUserPicturePost)
	g.POST("_/admin/users", HandleAdminUsersPost)
	g.POST("_/admin/venue", HandleAdminVenuePost)
	g.POST("_/admin/venue/picture", HandleAdminVenuePicturePost)
	g.POST("_/admin/venue/ico-picture", HandleAdminVenueIcoPicturePost)
	g.POST("_/admin/venue/svg-picture", HandleAdminVenueSvgPicturePost)
	g.POST("_/admin/groups", HandleAdminGroupsPost)
	g.GET("_/admin/cron-jobs", HandleAdminCronJobGet)
	g.POST("_/admin/cron-jobs", HandleAdminCronJobPost)
	g.DELETE("_/admin/cron-jobs/:id", HandleAdminCronJobDelete)
	g.POST("_/admin/cron-jobs/:id/run", HandleAdminCronJobRunPost)
	g.GET("_/admin/notifications/types", HandleAdminNotificationTypesGet)
	g.POST("_/admin/notifications/types", HandleAdminNotificationTypesPost)
	g.POST("_/admin/feature-flags", HandleAdminFeatureFlagsPost)

	return nil
}
