package notify

import (
	"fmt"

	twilio "github.com/twilio/twilio-go"
)

var client *twilio.RestClient

func Setup() error {
	client = twilio.NewRestClient()
	if client == nil {
		return fmt.Errorf("could not create twilio client")
	}

	err := EnsureNotificationSettings()
	if err != nil {
		return err
	}

	return nil
}
