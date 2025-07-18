package notify

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"strings"

	"com.codeka/scheduler/server/store"
	brevo "github.com/getbrevo/brevo-go/lib"
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

	from := brevo.SendSmtpEmailSender{
		Name:  "Shifts @ " + venue.ShortName,
		Email: strings.ToLower(venue.ShortName) + "@codeka.com",
	}
	subject := fmt.Sprintf(
		"%s %s shift on %s @ %s",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	to := brevo.SendSmtpEmailTo{
		Name:  user.Name,
		Email: user.Email,
	}

	ics, err := GenerateCalendarInvite(
		*shift,
		fmt.Sprintf("%s %s shift", venue.ShortName, group.Name),
		fmt.Sprintf("Do not delete this event. If you cannot make it to this shift, please cancel at the shifts website: %s", venue.ShiftsWebAddress),
		fmt.Sprintf("<strong>Do not delete this event</strong><br/>If you cannot make it to this shift, please cancel your shift at <a href='%s'>the shifts website</a>", venue.ShiftsWebAddress),
		user.Email)
	invite := brevo.SendSmtpEmailAttachment{
		Name:    "invite.ics",
		Content: base64.StdEncoding.EncodeToString([]byte(ics)),
	}
	if err != nil {
		return err
	}

	plainTextContent := fmt.Sprintf(
		"You have an upcoming %s %s shift on %s @ %s",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	htmlContent := plainTextContent
	message := brevo.SendSmtpEmail{
		Sender:      &from,
		Subject:     subject,
		To:          []brevo.SendSmtpEmailTo{to},
		TextContent: plainTextContent,
		HtmlContent: htmlContent,
		Attachment:  []brevo.SendSmtpEmailAttachment{invite},
	}

	_, _, err = brevoClient.TransactionalEmailsApi.SendTransacEmail(context.Background(), message)
	return err
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

	from := brevo.SendSmtpEmailSender{
		Name:  "Shifts @ " + venue.ShortName,
		Email: strings.ToLower(venue.ShortName) + "@codeka.com",
	}
	subject := fmt.Sprintf(
		"%s %s shift cancelled on %s @ %s",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	to := brevo.SendSmtpEmailTo{
		Name:  user.Name,
		Email: user.Email,
	}

	ics, err := GenerateCalendarCancel(*shift, user.Email)
	if err != nil {
		return err
	}
	invite := brevo.SendSmtpEmailAttachment{
		Name:    "invite.ics",
		Content: base64.StdEncoding.EncodeToString([]byte(ics)),
	}
	if err != nil {
		return err
	}
	plainTextContent := fmt.Sprintf(
		"Your upcoming %s %s shift on %s @ %s has been cancelled.",
		venue.ShortName,
		group.Name,
		shift.Date.Format("Mon 1/02"),
		shift.StartTime.Format("03:04 PM"))
	htmlContent := plainTextContent

	message := brevo.SendSmtpEmail{
		Sender:      &from,
		Subject:     subject,
		To:          []brevo.SendSmtpEmailTo{to},
		TextContent: plainTextContent,
		HtmlContent: htmlContent,
		Attachment:  []brevo.SendSmtpEmailAttachment{invite},
	}

	_, _, err = brevoClient.TransactionalEmailsApi.SendTransacEmail(context.Background(), message)
	return err
}
