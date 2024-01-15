package api

import (
	"time"

	"com.codeka/scheduler/server/store"
)

type User struct {
	ID    int64    `json:"id"`
	Name  string   `json:"name"`
	Mail  string   `json:"mail"`
	Phone string   `json:"phone"`
	Roles []string `json:"roles"`
}

// MakeUser converts the given store.User to our User type.
func MakeUser(user *store.User, roles []string) *User {
	if user == nil {
		return nil
	}

	return &User{
		ID:    user.ID,
		Name:  user.Name,
		Mail:  user.Mail,
		Phone: user.Phone,
		Roles: roles,
	}
}

type Event struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
}

func MakeEvent(event *store.Event) *Event {
	if event == nil {
		return nil
	}

	return &Event{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		StartTime:   event.StartTime,
		EndTime:     event.EndTime,
	}
}

func EventToStore(event *Event) *store.Event {
	return &store.Event{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		StartTime:   event.StartTime,
		EndTime:     event.EndTime,
	}
}
