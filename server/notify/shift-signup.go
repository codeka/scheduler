package notify

import (
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"strings"

	"com.codeka/scheduler/server/store"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

// SendShiftSignupNotification sends a notification to the person who just signed up for the given shift.
func SendShiftSignupNotification(shift *store.Shift, user *store.User) error {
	log.Printf("Sending calendar invite for shift %d to %s %s", shift.ID, user.Name, user.Email)

	venue, err := store.GetVenue()
	if err != nil {
		return err
	}
	group, err := store.GetGroup(shift.GroupID)
	if err != nil {
		return err
	}

	from := mail.NewEmail(
		"Shifts @ "+venue.ShortName,
		strings.ToLower(venue.ShortName)+"@codeka.com")
	subject := fmt.Sprintf(
		"%s %s shift on %s @ %s",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	to := mail.NewEmail(user.Name, user.Email)

	invite := mail.NewAttachment()
	ics, err := GenerateCalendarInvite(
		*shift,
		fmt.Sprintf("%s %s shift", venue.ShortName, group.Name),
		"description of the event",
		user.Email)
	if err != nil {
		return err
	}
	invite.Content = base64.StdEncoding.EncodeToString([]byte(ics))
	invite.Filename = "invite.ics"
	invite.Type = "text/calendar"
	invite.Disposition = "attachment"

	plainTextContent := "Please see attached for your shift invite."
	htmlContent := "<strong>Please see attached for your shift invite</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	message.Attachments = append(message.Attachments, invite)
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
