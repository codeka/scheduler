package store

import "time"

type Venue struct {
	ShortName string
	Name      string
	Address   string
}

type User struct {
	ID    int64
	Name  string
	Mail  string
	Phone string
}

type Event struct {
	ID          int64
	Title       string
	Description string
	StartTime   time.Time
	EndTime     time.Time
}
