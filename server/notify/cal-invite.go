package notify

import (
	"fmt"
	"strings"
	"time"

	"com.codeka/scheduler/server/store"
)

func generateUuid(shift store.Shift, recipient string) string {
	return fmt.Sprintf("com.codeka-shift-%d", shift.ID)
}

// GenerateCalendarInvite generates an ICS file (iCalendar) file that many email clients will
// interpret correctly and allow the user to add the event to their calendar.
// There are a bunch of Go libraries that do this in a generic way, but for now I'm just going
// to be lazy and do it kinda hardcoded like this.
func GenerateCalendarInvite(shift store.Shift, subject, description, recipient string) (string, error) {
	uuid := generateUuid(shift, recipient)

	// TODO: support more timezones than just US/Pacific?
	timeZone := "America/Los_Angeles"
	dateFormat := "20060102T150405"

	venue, err := store.GetVenue()
	if err != nil {
		return "", err
	}

	startDateTime := shift.StartTime.AddDate(shift.Date.Year(), int(shift.Date.Month())-1, shift.Date.Day()-1)
	endDateTime := shift.EndTime.AddDate(shift.Date.Year(), int(shift.Date.Month())-1, shift.Date.Day()-1)
	timeStamp := time.Now()

	ical := fmt.Sprintf(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//codeka.com//shift-manager//EN
METHOD:REQUEST
TIMEZONE-ID:%[5]s
X-WR-TIMEZONE:%[5]s
BEGIN:VEVENT
UID:%[1]s
SEQUENCE:%[12]d
DTSTAMP:%[2]s
DTSTART;TZID=%[5]s:%[3]s
DTEND;TZID=%[5]s:%[4]s
SUMMARY:%[6]s
DESCRIPTION:%[7]s
ATTENDEE;CUTYPE=INDIVIDUAL;EMAIL=%[8]s:mailto:%[8]s
ORGANIZER;CN="%[9]s":mailto:%[10]s@codeka.com
URL;VALUE=URI:%[11]s
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,
		uuid,
		timeStamp.Format(dateFormat),
		startDateTime.Format(dateFormat),
		endDateTime.Format(dateFormat),
		timeZone,
		subject,
		description,
		recipient,
		venue.Name,
		strings.ToLower(venue.ShortName),
		venue.ShiftsWebAddress,
		time.Now().Unix())

	return ical, nil
}

// GenerateCalendarCancel generates an ICS file (iCalendar) file that many email clients will
// interpret correctly as a cancellation of a previous event. Use when you remove a signup,
// we can email the recipient a cancellation and remove the invite from their calendar.
func GenerateCalendarCancel(shift store.Shift, recipient string) (string, error) {
	uuid := generateUuid(shift, recipient)

	// TODO: support more timezones than just US/Pacific?
	timeZone := "America/Los_Angeles"
	dateFormat := "20060102T150405"

	venue, err := store.GetVenue()
	if err != nil {
		return "", err
	}

	startDateTime := shift.StartTime.AddDate(shift.Date.Year(), int(shift.Date.Month())-1, shift.Date.Day()-1)
	endDateTime := shift.EndTime.AddDate(shift.Date.Year(), int(shift.Date.Month())-1, shift.Date.Day()-1)
	timeStamp := time.Now()

	ical := fmt.Sprintf(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//codeka.com//shift-manager//EN
METHOD:CANCEL
BEGIN:VEVENT
UID:%[1]s
SEQUENCE:%[10]d
DTSTAMP:%[2]s
DTSTART;TZID=%[5]s:%[3]s
DTEND;TZID=%[5]s:%[4]s
SUMMARY:Shift Cancellation
ATTENDEE;CUTYPE=INDIVIDUAL;EMAIL=%[6]s:mailto:%[6]s
ORGANIZER;CN="%[7]s":mailto:%[8]s@codeka.com
URL;VALUE=URI:%[9]s
STATUS:CANCELED
END:VEVENT
END:VCALENDAR`,
		uuid,
		timeStamp.Format(dateFormat),
		startDateTime.Format(dateFormat),
		endDateTime.Format(dateFormat),
		timeZone,
		recipient,
		venue.Name,
		strings.ToLower(venue.ShortName),
		venue.ShiftsWebAddress,
		time.Now().Unix())

	return ical, nil
}
