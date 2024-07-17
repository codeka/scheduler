package main

import (
	"log"
	"os"
	"time"

	"com.codeka/scheduler/server/api"
	"com.codeka/scheduler/server/store"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	router := gin.Default()
	if os.Getenv("DEBUG") != "" {
		// Allow requests from other domains in debug mode (in particular, the angular stuff will be
		// running on a different domain in debug mode).
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"*"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Authorization", "Origin", "Content-Type"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	}

	datadir := os.Getenv("DATA_DIR")
	if err := store.Init(datadir); err != nil {
		panic(err)
	}
	if err := api.Setup(router); err != nil {
		panic(err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(router.Run("localhost:" + port))
}
