package notify

import (
	"fmt"
	"log"

	"com.codeka/scheduler/server/store"
)

// GenerateCalendarInvite generates an ICS file (iCalendar) file that many email clients will
// interpret correctly and allow the user to add the event to their calendar.
// There are a bunch of Go libraries that do this in a generic way, but for now I'm just going
// to be lazy and do it kinda hardcoded like this.
func GenerateCalendarInvite(shift store.Shift, subject, description, recipient string) (string, error) {
	uuid := fmt.Sprintf("com.codeka-shift-%d", shift.ID)

	// TODO: support more timezones than just US/Pacific?
	timeZone := "America/Los_Angeles"
	dateFormat := "20060102T150405"

	venue, err := store.GetVenue()
	if err != nil {
		return "", err
	}

	startDateTime := shift.StartTime.AddDate(shift.Date.Year(), int(shift.Date.Month())-1, shift.Date.Day()-1)
	endDateTime := shift.EndTime.AddDate(shift.Date.Year(), int(shift.Date.Month())-1, shift.Date.Day()-1)

	ical := fmt.Sprintf(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//codeka.com//shift-manager//EN
METHOD:REQUEST
TIMEZONE-ID:%[4]s
X-WR-TIMEZONE:%[4]s
BEGIN:VEVENT
UID:%[1]s
SEQUENCE:0
DTSTAMP:%[2]s
DTSTART;TZID=%[4]s:%[2]s
DTEND;TZID=%[4]s:%[3]s
SUMMARY:%[5]s
DESCRIPTION:%[6]s
ATTENDEE;CUTYPE=INDIVIDUAL;EMAIL=%[7]s:mailto:%[7]s
ORGANIZER;CN="%[8]s":mailto:dean@codeka.com
URL;VALUE=URI:%[9]s
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,
		uuid,
		startDateTime.Format(dateFormat),
		endDateTime.Format(dateFormat),
		timeZone,
		subject,
		description,
		recipient,
		venue.Name,
		venue.ShiftsWebAddress)

	log.Printf("shift: %s", startDateTime)
	log.Printf("iCal: %s", ical)
	return ical, nil
}
