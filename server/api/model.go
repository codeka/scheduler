package api

import (
	"com.codeka/scheduler/server/store"
)

type User struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Mail  string `json:"mail"`
	Phone string `json:"phone"`
}

// MakeUser converts the given store.User to our User type.
func MakeUser(user *store.User) *User {
	if user == nil {
		return nil
	}

	return &User{
		ID:    user.ID,
		Name:  user.Name,
		Mail:  user.Mail,
		Phone: user.Phone,
	}
}
