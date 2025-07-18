package api

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"com.codeka/scheduler/server/notify"
	"com.codeka/scheduler/server/store"
	"com.codeka/scheduler/server/util"
	"github.com/gin-gonic/gin"
)

type SendConfirmationRequest struct {
	EmailOrPhone string `json:"emailOrPhone"`
}

type ConfirmationSentResponse struct {
	// Will be either "EMAIL" or "PHONE" depending on where we sent the confirmation request to.
	destination string
}

type VerifyConfirmationRequest struct {
	EmailOrPhone     string `json:"emailOrPhone"`
	ConfirmationCode string `json:"confirmationCode"`
}

type VerifyConfirmationResponse struct {
	User      *User  `json:"user"`
	SecretKey string `json:"secretKey"`
}

var (
	ConfirmationCodeLetters = []rune("0123456789")
	ConfirmationCodeSize    = 6

	SecretLetters = []rune("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	SecretSize    = 64
)

// HandleSendConfirmation handles requests for /_/auth/send-confirmation which indicates a user is trying to log in. We
// will look up their user record and send a code to the email address or phone number (if there is one).
func HandleSendConfirmation(c *gin.Context) {
	var req SendConfirmationRequest
	if err := c.BindJSON(&req); err != nil {
		// TODO: handle the error
		return
	}

	resp := ConfirmationSentResponse{}
	var user *store.User
	var err error

	emailOrPhone := strings.ToLower(strings.TrimSpace(req.EmailOrPhone))
	if util.IsEmailAddress(emailOrPhone) {
		log.Printf(" - logging in with email [%s]", emailOrPhone)
		resp.destination = "EMAIL"
		user, err = store.GetUserByEmail(emailOrPhone)
	} else if util.IsPhoneNumber(emailOrPhone) {
		log.Printf(" - logging in with phone [%s]", emailOrPhone)
		resp.destination = "PHONE"
		user, err = store.GetUserByPhone(emailOrPhone)
	} else {
		util.HandleError(c, http.StatusBadRequest, fmt.Errorf("invalid email or phone number"))
		return
	}
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	if user == nil {
		// Let the caller know the email/phone doesn't exist. It leaks info about which email/phones we have/don't have,
		// but the usability of knowing your email isn't registered is worth it for us.
		log.Printf("Couldn't find user for email/phone: [%s]", emailOrPhone)
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	code, err := notify.SendVerificationRequest(notify.VerificationRequest{Dest: emailOrPhone})
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, err)
		return
	}

	err = store.CreateUserLogin(user, code)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}

// HandleVerifyConfirmation handles requests to /_/auth/verify-confirmation. After we've sent you a confirmation code,
// we need to verify that you received it. Once you have, we confirm your login to a proper login and send you the
// secret key that you can use to validate subsequent requests.
func HandleVerifyConfirmation(c *gin.Context) {
	var req VerifyConfirmationRequest
	if err := c.BindJSON(&req); err != nil {
		// TODO: handle the error
		return
	}

	resp := VerifyConfirmationResponse{}

	user, err := store.GetUserByConfirmationCode(req.ConfirmationCode)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	if user == nil {
		log.Printf("No user found with confirmation code: %s", req.ConfirmationCode)
		c.AbortWithError(http.StatusForbidden, err)
		return
	}

	roles, err := store.GetUserRoles(user.ID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	groups, err := store.GetUserGroups(user.ID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	resp.User = MakeUser(user, roles, groups)

	if resp.User == nil {
		// They've entered an invalid confirmation code. Let them know.
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	resp.SecretKey, err = util.RandomSequence(SecretSize, SecretLetters)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = store.SaveSecret(resp.User.ID, req.ConfirmationCode, resp.SecretKey)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}

func setupAuth(g *gin.Engine) error {
	g.POST("_/auth/send-confirmation", HandleSendConfirmation)
	g.POST("_/auth/verify-confirmation", HandleVerifyConfirmation)

	return nil
}
