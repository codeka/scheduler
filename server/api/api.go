package api

import "github.com/gin-gonic/gin"

func Setup(g *gin.Engine) error {
	g.GET("_/init", HandleInit)

	return nil
}
