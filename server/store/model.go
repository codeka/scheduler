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
	ID               int64
	Name             string
	MinSignups       int32
	AlwaysShow       bool
	ShiftStartOffset time.Duration
	ShiftEndOffset   time.Duration
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

// NotificationType describes a single notification. For example, the notification that is send the day before a shift,
// or the notification that is sent a week before a shift if it's not full, etc.
type NotificationType struct {
	// Id is the identifier of this notification, and semi-user readable string that we
	// can use to refer to the notification in code.
	ID string

	// Description is the human-readable description of the notification, shown to the
	// user to decide whether they want to receive it or not.
	Description string

	// Whether email/SMS is enabled for this reminder by default, for any new user who signs up.
	DefaultEmailEnabled bool
	DefaultSMSEnabled   bool
}

// NotificationSetting is a single user's setting for whether and how they want to receive a particular notification.
type NotificationSetting struct {
	// UserID is the ID of the user this setting is for.
	UserID int64

	// NotificationID is the ID of the notification this setting is for.
	NotificationID string

	// Whether the user has email and/or SMS enabled for this notification.
	EmailEnabled bool
	SMSEnabled   bool
}
