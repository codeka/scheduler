package cron

import (
	"context"
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func cronSendReminders(context.Context) error {
	log.Printf("api key: %s", os.Getenv("SENDGRID_API_KEY"))

	from := mail.NewEmail("No Reply", "noreply@codeka.com")
	subject := "Sending with SendGrid is Fun"
	to := mail.NewEmail("Dean", "dean@codeka.com")
	plainTextContent := "and easy to do anywhere, even with Go"
	htmlContent := "<strong>and easy to do anywhere, even with Go</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
	response, err := client.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		log.Println(response.StatusCode)
		log.Println(response.Body)
		log.Println(response.Headers)
	}
	return nil
}
