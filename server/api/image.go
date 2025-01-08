package api

import (
	"strings"

	"com.codeka/scheduler/server/store"
	"github.com/gin-gonic/gin"
)

func HandleImageGet(c *gin.Context) {
	name := c.Param("filename")
	ext := "png"
	if strings.HasSuffix(name, ".ico") {
		ext = "ico"
	} else if strings.HasSuffix(name, ".svg") {
		ext = "svg"
	}
	name = strings.TrimSuffix(name, ".png")
	name = strings.TrimSuffix(name, ".gif")
	name = strings.TrimSuffix(name, ".jpg")
	name = strings.TrimSuffix(name, ".ico")
	name = strings.TrimSuffix(name, ".svg")

	c.File(store.ImageFileName(name, ext))
}

func setupImage(g *gin.Engine) error {
	g.GET("_/img/:filename", HandleImageGet)

	return nil
}
