package api

import (
	"github.com/gin-gonic/gin"
)

func Setup(g *gin.Engine) error {
	// Util has to be first, as it adds our middleware.
	if err := setupUtil(g); err != nil {
		return err
	}

	g.GET("_/favicon.ico", HandleFavicon)
	g.GET("_/init", HandleInit)
	if err := setupAuth(g); err != nil {
		return err
	}
	if err := setupEvents(g); err != nil {
		return err
	}
	if err := setupAdmin(g); err != nil {
		return err
	}
	if err := setupImage(g); err != nil {
		return err
	}
	if err := setupProfile(g); err != nil {
		return err
	}

	return nil
}
