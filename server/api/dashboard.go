package api

import (
	"net/http"

	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
	"github.com/gin-gonic/gin"
)

type DashboardResponse struct {
	DashboardMotd *DashboardMotd `json:"motd"`
}

// HandleDashboardGet handles requests to /_/dashboard.
func HandleDashboardGet(c *gin.Context) {
	resp := DashboardResponse{}

	motd, err := store.GetLatestDashboardMotd()
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, err)
		return
	}
	resp.DashboardMotd = MakeDashboardMotd(motd)

	c.JSON(http.StatusOK, resp)
}

func setupDashboard(g *gin.Engine) error {
	g.GET("_/dashboard", HandleDashboardGet)

	return nil
}
