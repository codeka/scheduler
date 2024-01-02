package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite"
)

type Venue struct {
	// ShortName is the short, globally unique, name for this venue. It's user-readable and typically known to the
	// people who attend. For example, "Silicon Valley Buddhist Center" is often shortened to "SVBC".
	ShortName string `json:"shortName"`

	// The full name of the venue, for example, "Silicon Valley Buddhist Center".
	FullName string `json:"fullName"`

	// Address is the street address of the center.
	Address string `json:"address"`
}

// TODO: load this from a file or something?
var venues = []Venue{
	{ShortName: "SVBC", FullName: "Silicon Valley Buddhist Center", Address: "123 Fake St, Santa Clara, CA, 95050"},
	{ShortName: "SFBC", FullName: "San Francisco Buddhist Center", Address: "123 Fake St, San Francisco, CA, 91234"},
}

func getVenues(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, venues)
}

func main() {
	router := gin.Default()

	//datadir := os.Getenv("DATA_DIR")

	router.GET("/venues", getVenues)

	router.Run("localhost:8080")
}
