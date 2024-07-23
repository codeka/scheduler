package util

import (
	"crypto/rand"
	"strconv"
	"strings"
)

// RandomSequence returns a random sequence of length n from the given letters
func RandomSequence(n int, letters []rune) (string, error) {
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

// IsEmailAddress returns true if the given string appears to be an email address.
func IsEmailAddress(str string) bool {
	return strings.Index(str, "@") >= 0
}

// IsPhoneNumber returns true if the given string appears to be a phone number.
func IsPhoneNumber(str string) bool {
	if str[0] != '+' {
		return false
	}

	// TODO: support non-US phone numbers?
	if str[1] != '1' {
		return false
	}

	// This is not super accurate. Maybe there's a better way to validate a phone number?
	i, err := strconv.Atoi(str[2:])
	return err == nil && i > 10000
}
