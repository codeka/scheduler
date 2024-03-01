package store

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"
)

func makeEvent(row *sql.Rows) (*Event, error) {
	event := &Event{}
	var date, startTime, endTime string
	if err := row.Scan(&event.ID, &event.Title, &event.Description, &date, &startTime, &endTime); err != nil {
		return nil, err
	}

	var err error
	if event.Date, err = time.Parse(time.DateOnly, date); err != nil {
		return nil, err
	}
	if event.StartTime, err = time.Parse(time.TimeOnly, startTime); err != nil {
		return nil, err
	}
	if event.EndTime, err = time.Parse(time.TimeOnly, endTime); err != nil {
		return nil, err
	}

	return event, nil
}

func makeShift(row *sql.Rows) (*Shift, error) {
	shift := &Shift{}
	var date, startTime, endTime string
	if err := row.Scan(&shift.ID, &shift.GroupID, &date, &startTime, &endTime); err != nil {
		return nil, err
	}

	var err error
	if shift.Date, err = time.Parse(time.DateOnly, date); err != nil {
		return nil, err
	}
	if shift.StartTime, err = time.Parse(time.TimeOnly, startTime); err != nil {
		return nil, err
	}
	if shift.EndTime, err = time.Parse(time.TimeOnly, endTime); err != nil {
		return nil, err
	}

	return shift, nil
}

// GetEventsInDateRange ...
func GetEventsInDateRange(startDate, endDate time.Time) ([]*Event, error) {
	rows, err := db.Query(`
			SELECT
				id, title, description, date, start_time, end_time
			FROM events
			WHERE date >= ?
			  AND date <= ?
			ORDER BY date, start_time`,
		startDate.Format(time.DateOnly),
		endDate.Format(time.DateOnly))
	if err != nil {
		return nil, fmt.Errorf("error querying events in date range: %v", err)
	}
	defer rows.Close()

	var events []*Event
	for rows.Next() {
		event, err := makeEvent(rows)
		if err != nil {
			// TODO: this is a bad error, notify the devs?
			log.Printf("Error exracting event! %v", err)
			continue
		}
		events = append(events, event)
	}
	return events, nil
}

func SaveEvent(event *Event) error {
	date := event.Date.Format(time.DateOnly)
	startTime := event.StartTime.Format(time.TimeOnly)
	endTime := event.EndTime.Format(time.TimeOnly)

	if event.ID == 0 {
		_, err := db.Exec(`
			INSERT INTO events
			  (title, description, date, start_time, end_time)
			VALUES
			  (?, ?, ?, ?, ?)`,
			event.Title, event.Description, date, startTime, endTime)
		return err
	}
	// TODO: implement update
	return fmt.Errorf("not implemented yet")
}

func GetShiftsInDateRange(startDate, endDate time.Time) ([]*Shift, error) {
	rows, err := db.Query(`
			SELECT
				id, group_id, date, start_time, end_time
			FROM shifts
			WHERE date >= ?
			  AND date <= ?
			ORDER BY date, start_time`,
		startDate.Format(time.DateOnly),
		endDate.Format(time.DateOnly))
	if err != nil {
		return nil, fmt.Errorf("error querying shifts in date range: %v", err)
	}
	defer rows.Close()

	var shifts []*Shift
	for rows.Next() {
		shift, err := makeShift(rows)
		if err != nil {
			// TODO: this is a bad error, notify the devs?
			log.Printf("Error extracting shift: %v", err)
			continue
		}
		shifts = append(shifts, shift)
	}
	return shifts, nil
}

func GetShift(id int64) (*Shift, error) {
	rows, err := db.Query(`
			SELECT
				id, group_id, date, start_time, end_time
			FROM shifts
			WHERE id = ?`, id)
	if err != nil {
		return nil, fmt.Errorf("error querying shift: %v", err)
	}
	defer rows.Close()

	if rows.Next() {
		shift, err := makeShift(rows)
		if err != nil {
			return nil, fmt.Errorf("error parsing shift: %v", err)
		}

		return shift, err
	}
	return nil, fmt.Errorf("shift not found: %d", id)
}

// Gets a mapping of the userIDs that are signed up for the given
func GetShiftUsers(shiftID ...int64) ([]*ShiftSignup, error) {
	shiftIDStrs := make([]string, len(shiftID))
	for i, id := range shiftID {
		shiftIDStrs[i] = strconv.FormatInt(id, 10)
	}

	rows, err := db.Query(`
	  SELECT shift_id, user_id, notes FROM shift_users WHERE shift_id IN (` + strings.Join(shiftIDStrs, ", ") + `)`)
	if err != nil {
		return []*ShiftSignup{}, err
	}

	var signups []*ShiftSignup
	for rows.Next() {
		signup := &ShiftSignup{}
		err = rows.Scan(&signup.ShiftID, &signup.UserID, &signup.Notes)
		if err != nil {
			return []*ShiftSignup{}, err
		}
		signups = append(signups, signup)
	}

	return signups, nil
}

func SaveShift(shift *Shift) error {
	date := shift.Date.Format(time.DateOnly)
	startTime := shift.StartTime.Format(time.TimeOnly)
	endTime := shift.EndTime.Format(time.TimeOnly)

	// TODO: verify that the GroupID is a valid group.

	if shift.ID == 0 {
		_, err := db.Exec(`
			INSERT INTO shifts
			  (group_id, date, start_time, end_time)
			VALUES
			  (?, ?, ?, ?)`,
			shift.GroupID, date, startTime, endTime)
		return err
	}
	// TODO: implement update
	return fmt.Errorf("not implemented yet")
}

func SaveShiftUser(shiftID, userID int64, notes string) error {
	_, err := db.Exec(`
	    INSERT INTO shift_users (user_id, shift_id, notes) VALUES (?, ?, ?)`,
		userID, shiftID, notes)
	return err
}
