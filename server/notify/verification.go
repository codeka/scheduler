package notify

import (
	"fmt"

	"com.codeka/scheduler/server/util"
	verify "github.com/twilio/twilio-go/rest/verify/v2"
)

const (
	// TODO: should this be passed in?
	VerificationServiceSID = "VAb4bae137798d2473675cc548e6bd9b76"
)

type VerificationRequest struct {
	// Who to send the verification to. This will be either the user's email address or phone number.
	Dest string
}

type ConfirmationRequest struct {
	Dest string
	Code string
}

// SendVerificationRequest sends a verification request to the user and returns the SID of the request, or nil and an
// error if there was some kind of error.
func SendVerificationRequest(request VerificationRequest) (string, error) {
	params := &verify.CreateVerificationParams{}
	if util.IsEmailAddress(request.Dest) {
		params.SetChannel("email")

		params.SetChannelConfiguration(map[string]interface{}{
			"from":      "svbc@codeka.com",
			"from_name": "SVBC Scheduler",
			"substitutions": map[string]interface{}{
				"dest": request.Dest,
			},
		})
	} else if util.IsPhoneNumber(request.Dest) {
		params.SetChannel("sms")
	} else {
		return "", fmt.Errorf("destination does not appear to be valid email or phone number")
	}
	params.SetTo(request.Dest)

	resp, err := client.VerifyV2.CreateVerification(VerificationServiceSID, params)
	if err != nil {
		return "", err
	}

	return *resp.Sid, nil
}

// ConfirmVerification attempts to confirm that you've actually got the correct email.
func ConfirmVerification(request ConfirmationRequest) (string, error) {
	params := &verify.CreateVerificationCheckParams{}
	params.SetTo(request.Dest)
	params.SetCode(request.Code)

	resp, err := client.VerifyV2.CreateVerificationCheck(VerificationServiceSID, params)
	if err != nil {
		return "", err
	}

	if resp.Status != nil && *resp.Status == "approved" {
		return *resp.Sid, nil
	} else {
		return "", fmt.Errorf("wrong code")
	}
}
