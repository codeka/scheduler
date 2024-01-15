package api

import (
	"net/http"
	"time"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

type EventsResponse struct {
	Events []*Event `json:"events"`
}

// HandleEventsGet handles requests to /_/events. It returns the events in the data store, filtered by various query
// parameters, including:
// ?dateFrom={}&dateTo={} - between the given date ranges
func HandleEventsGet(c *gin.Context) {
	resp := EventsResponse{}

	if c.Query("dateFrom") != "" && c.Query("dateTo") != "" {
		dateFrom, err := time.Parse(time.DateOnly, c.Query("dateFrom"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		dateTo, err := time.Parse(time.DateOnly, c.Query("dateTo"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		events, err := store.GetEventsInDateRange(dateFrom, dateTo)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		for _, e := range events {
			resp.Events = append(resp.Events, MakeEvent(e))
		}
	}

	c.JSON(http.StatusOK, resp)
}

// HandleEventsPosts handles POST requests to /_/events. We save the event you've posted to the data store.
func HandleEventsPost(c *gin.Context) {
	var event Event
	if err := c.BindJSON(&event); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := store.SaveEvent(EventToStore(&event)); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.AbortWithStatus(http.StatusOK)
}

func setupEvents(g *gin.Engine) error {
	g.GET("_/events", HandleEventsGet)
	g.POST("_/events", HandleEventsPost)

	return nil
}
