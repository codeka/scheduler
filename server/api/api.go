package api

import "github.com/gin-gonic/gin"

func Setup(g *gin.Engine) error {
	g.GET("_/init", HandleInit)
	if err := setupAuth(g); err != nil {
		return nil
	}

	return nil
}
