package util

import "crypto/rand"

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
