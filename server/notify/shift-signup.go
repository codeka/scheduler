package notify

import (
	"encoding/base64"
	"fmt"
	"log"
	"strings"

	"com.codeka/scheduler/server/store"
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
		fmt.Sprintf("Do not delete this event. If you cannot make it to this shift, please cancel at the shifts website: %s", venue.ShiftsWebAddress),
		fmt.Sprintf("<strong>Do not delete this event</strong><br/>If you cannot make it to this shift, please cancel your shift at <a href='%s'>the shifts website</a>", venue.ShiftsWebAddress),
		user.Email)
	if err != nil {
		return err
	}
	invite.Content = base64.StdEncoding.EncodeToString([]byte(ics))
	invite.Filename = "invite.ics"
	invite.Type = "text/calendar"
	invite.Disposition = "attachment"

	plainTextContent := fmt.Sprintf(
		"You have an upcoming %s %s shift on %s @ %s",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	htmlContent := plainTextContent
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	message.Attachments = append(message.Attachments, invite)
	response, err := sendgridClient.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		log.Println(response.StatusCode)
		log.Println(response.Body)
		log.Println(response.Headers)
	}

	return nil
}

// SendShiftCancellationNotification sends a notification to the person that a shift has been cancelled.
func SendShiftCancellationNotification(shift *store.Shift, user *store.User) error {
	log.Printf("Sending calendar cancellation for shift %d to %s %s", shift.ID, user.Name, user.Email)

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
		"%s %s shift cancelled on %s @ %s",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	to := mail.NewEmail(user.Name, user.Email)

	invite := mail.NewAttachment()
	ics, err := GenerateCalendarCancel(*shift, user.Email)
	if err != nil {
		return err
	}
	invite.Content = base64.StdEncoding.EncodeToString([]byte(ics))
	invite.Filename = "invite.ics"
	invite.Type = "text/calendar"
	invite.Disposition = "attachment"

	plainTextContent := fmt.Sprintf(
		"Your upcoming %s %s shift on %s @ %s has been cancelled.",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	htmlContent := plainTextContent
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	message.Attachments = append(message.Attachments, invite)
	response, err := sendgridClient.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		log.Println(response.StatusCode)
		log.Println(response.Body)
		log.Println(response.Headers)
	}

	return nil
}
