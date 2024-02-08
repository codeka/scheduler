package api

import (
	"strings"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

func HandleImageGet(c *gin.Context) {
	name := c.Param("filename")
	name = strings.TrimSuffix(name, ".png")
	name = strings.TrimSuffix(name, ".gif")
	name = strings.TrimSuffix(name, ".jpg")

	c.File(store.ImageFileName(name))
}

func setupImage(g *gin.Engine) error {
	g.GET("_/img/:filename", HandleImageGet)

	return nil
}
