package notify

import (
	"fmt"
	"os"

	"github.com/sendgrid/sendgrid-go"
	twilio "github.com/twilio/twilio-go"
)

var twilioClient *twilio.RestClient
var sendgridClient *sendgrid.Client

func Setup() error {
	twilioClient = twilio.NewRestClient()
	if twilioClient == nil {
		return fmt.Errorf("could not create twilio client")
	}

	sendgridClient = sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
	if sendgridClient == nil {
		return fmt.Errorf("could not create sendgrid client")
	}

	err := EnsureNotificationTypes()
	if err != nil {
		return err
	}
	err = EnsureNotificationSettings()
	if err != nil {
		return err
	}

	return nil
}
