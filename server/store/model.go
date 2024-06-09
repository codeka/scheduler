package store

import "time"

type Venue struct {
	ShortName   string
	Name        string
	Address     string
	PictureName string
}

type User struct {
	ID          int64
	Name        string
	Email       string
	Phone       string
	PictureName string
}

type Event struct {
	ID          int64
	Title       string
	Description string
	// Date is the date (only) the event occurs on. Events do not span more than on day in the venue's local time.
	// StartTime and EndTime are the time (only) when the event starts and ends.
	Date      time.Time
	StartTime time.Time
	EndTime   time.Time
}

type Group struct {
	ID         int64
	Name       string
	MinSignups int32
}

type Shift struct {
	ID        int64
	GroupID   int64
	Date      time.Time
	StartTime time.Time
	EndTime   time.Time
}

type ShiftSignup struct {
	ShiftID int64
	UserID  int64
	Notes   string
}
