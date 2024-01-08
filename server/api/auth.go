package api

import (
	"crypto/rand"
	"log"
	"net/http"
	"strings"

	"com.codeka/scheduler/server/store"
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
	ConfirmationCode string `json:"confirmationCode"`

	// TODO: should we include the email/phone you were trying to confirm? Maybe not?
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

// randomSequence returns a random sequence of length n from the given letters
func randomSequence(n int, letters []rune) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	runes := make([]rune, n)
	for i := range runes {
		runes[i] = letters[int(bytes[i])%len(letters)]
	}
	return string(runes), nil
}

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
	isEmail := strings.Contains(req.EmailOrPhone, "@")
	// TODO: if it's not an email and not a phone number, that's an error

	if isEmail {
		resp.destination = "EMAIL"
		user, err = store.GetUserByEmail(req.EmailOrPhone)
	} else {
		resp.destination = "PHONE"
		user, err = store.GetUserByPhone(req.EmailOrPhone)
	}
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if user == nil {
		// Let the caller know the email/phone doesn't exist. It leaks info about which email/phones we have/don't have,
		// but the usability of knowing your email isn't registered is worth it for us.
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	code, err := randomSequence(ConfirmationCodeSize, ConfirmationCodeLetters)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// TODO: make sure this code is not already assigned to someone else.

	if isEmail {
		// Assume it's an email, try to send the email.
		log.Printf("TODO: send email with code %s", code)
	} else {
		log.Printf("TODO: send SMS with code %s", code)
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

	if user, err := store.GetUserByConfirmationCode(req.ConfirmationCode); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	} else {
		resp.User = MakeUser(user)
	}

	if resp.User == nil {
		// They've entered an invalid confirmation code. Let them know.
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	var err error
	resp.SecretKey, err = randomSequence(SecretSize, SecretLetters)
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
