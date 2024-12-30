package notify

import (
	"com.codeka/scheduler/server/store"
)

// SendShiftSignupNotification sends a notification to the person who just signed up for the given shift.
func SendShiftSignupNotification(shift *store.Shift, user *store.User) error {
	//venue, err := store.GetVenue()
	//if err != nil {
	//	return err
	//}
	//group, err := store.GetGroup(shift.GroupID)
	//if err != nil {
	//	return err
	//}

	//from := mail.NewEmail("No Reply", "noreply@codeka.com")
	//subject := fmt.Sprintf("%s %s shift on %s @ %s", venue.ShortName, group.Name, shift.Date.Format("Mon 1/02"), shift.StartTime.Format("03:04 PM"))
	//to := mail.NewEmail(user.Name, user.Email)

	/*
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
		}*/

	return nil
}
