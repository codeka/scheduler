package notify

import (
	"context"
	"fmt"
	"log"
	"strings"

	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"

	brevo "github.com/getbrevo/brevo-go/lib"
)

var (
	ConfirmationCodeLetters = []rune("0123456789")
	ConfirmationCodeSize    = 6
)

type VerificationRequest struct {
	// Who to send the verification to. This will be either the user's email address or phone number.
	Dest string
}

type ConfirmationRequest struct {
	Dest string
	Code string
}

func generateConfirmationCode(user *store.User) (string, error) {
	if user.ConfirmationCode != "" {
		// If they already have a confirmation code, use the same one. This is easier if people
		// repeatedly request a code, we'll give them the same one.
		return user.ConfirmationCode, nil
	}

	code, err := util.RandomSequence(ConfirmationCodeSize, ConfirmationCodeLetters)
	if err != nil {
		return "", err
	}

	// Save the user with the new code.
	user.ConfirmationCode = code
	err = store.SaveUser(user)
	if err != nil {
		return "", err
	}

	return code, nil
}

// SendVerificationRequest sends a verification request to the user and returns the verification code, or nil and an
// error if there was some kind of error.
func SendVerificationRequest(request VerificationRequest) (string, error) {
	venue, err := store.GetVenue()
	if err != nil {
		return "", err
	}

	if util.IsEmailAddress(request.Dest) {
		user, err := store.GetUserByEmail(request.Dest)
		if err != nil {
			return "", err
		}
		if user == nil {
			return "", fmt.Errorf("No user with given email")
		}
		code, err := generateConfirmationCode(user)

		// TODO: do a better job of formatting the HTML here
		buttonStyle := "background-color: #333333; border: 1px solid #333333; border-radius: 6px; border-width: 1px; color:#ffffff; display: inline-block; font-size: 14px; padding: 12px 18px; text-decoration: none;"
		html := fmt.Sprintf(
			"<p><a style=\"%s\" href=\"%slogin/confirm?emailOrPhone=%s&code=%s&action=submit\">Click here to verify your email address</a></p>",
			buttonStyle, venue.ShiftsWebAddress, request.Dest, code)
		html += fmt.Sprintf("<p>Or, enter code <strong>%s</strong> where prompted</p>", code)

		email := brevo.SendSmtpEmail{
			Sender: &brevo.SendSmtpEmailSender{
				Name:  "Shifts @ " + venue.ShortName,
				Email: strings.ToLower(venue.ShortName) + "@codeka.com",
			},
			To: []brevo.SendSmtpEmailTo{
				{
					Name:  user.Name,
					Email: user.Email,
				},
			},
			Subject:     fmt.Sprintf("Shifts @ %s login verification", venue.ShortName),
			TextContent: "Enter confirmation code: " + code,
			HtmlContent: html,
			Tags:        []string{"verification_code"},
		}
		_, _, err = brevoClient.TransactionalEmailsApi.SendTransacEmail(context.Background(), email)
		if err != nil {
			return "", fmt.Errorf("error sending email: %v", err)
		}
		return code, nil
	} else if util.IsPhoneNumber(request.Dest) {
		user, err := store.GetUserByPhone(request.Dest)
		if err != nil {
			return "", err
		}
		if user == nil {
			return "", fmt.Errorf("No user with given phone number")
		}

		code, err := generateConfirmationCode(user)
		sms := brevo.SendTransacSms{
			Sender:    venue.ShortName,
			Recipient: user.Phone,
			Content:   "Your confirmation code is: " + code,
			Type_:     "transactional",
			Tag:       "verification_code",
			// WebUrl: TODO for tracking?
			OrganisationPrefix: venue.ShortName,
		}
		resp, _, err := brevoClient.TransactionalSMSApi.SendTransacSms(context.Background(), sms)
		if err != nil {
			return "", err
		}
		log.Println("SMS sent", resp.MessageId, "used credit=", resp.UsedCredits, "remaining credit=", resp.RemainingCredits)
		// TODO: when remaining credits get low, notifiy the admin (me) to buy more?

		return code, nil
	} else {
		return "", fmt.Errorf("destination does not appear to be valid email or phone number")
	}
}
