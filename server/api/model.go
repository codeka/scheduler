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
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	// JSON date/times are always in UTC, which is not what we want. We manually format all date/times as
	// yyyy-mm-dd for dates, hh:mm:ss for times, with no timezone information. Events do no span multiple days, the
	// start and ent time all fall on the same date.
	Date      string `json:"date"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

func MakeEvent(event *store.Event) *Event {
	if event == nil {
		return nil
	}

	return &Event{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		Date:        event.Date.Format(time.DateOnly),
		StartTime:   event.StartTime.Format(time.TimeOnly),
		EndTime:     event.EndTime.Format(time.TimeOnly),
	}
}

func EventToStore(event *Event) (*store.Event, error) {
	dt, err := time.Parse(time.DateOnly, event.Date)
	if err != nil {
		return nil, err
	}
	startTime, err := time.Parse(time.TimeOnly, event.StartTime)
	if err != nil {
		return nil, err
	}
	endTime, err := time.Parse(time.TimeOnly, event.EndTime)
	if err != nil {
		return nil, err
	}

	return &store.Event{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		Date:        dt,
		StartTime:   startTime,
		EndTime:     endTime,
	}, nil
}

type Group struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	// TODO: default start time, default end time, description etc.
}

func MakeGroup(group *store.Group) *Group {
	if group == nil {
		return nil
	}

	return &Group{
		ID:   group.ID,
		Name: group.Name,
	}
}
