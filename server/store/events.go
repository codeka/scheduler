package store

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

func makeEvent(row *sql.Rows) (*Event, error) {
	event := &Event{}
	var date, startTime, endTime time.Time
	if err := row.Scan(&event.ID, &event.Title, &event.Description, &date, &startTime, &endTime); err != nil {
		return nil, err
	}

	// TODO: time.Local should be configured per-venue.
	event.StartTime =
		time.Date(
			date.Year(), date.Month(), date.Day(), startTime.Hour(), startTime.Minute() /*sec*/, 0 /*nsec*/, 0, time.Local)
	event.EndTime =
		time.Date(
			date.Year(), date.Month(), date.Day(), endTime.Hour(), endTime.Minute() /*sec*/, 0 /*nsec*/, 0, time.Local)

	return event, nil
}

// GetUserByEmail returns the User with the given email address. If the user doesn't exit, returns a nil User and nil
// error. Any other kind of error returns a non-nil error.
func GetEventsInDateRange(dateFrom, dateTo time.Time) ([]*Event, error) {
	rows, err := db.Query(`
			SELECT
				id, title, description, date, start_time, end_time
			FROM events
			WHERE date >= ?
			  AND date <= ?
			ORDER BY date, start_time`, dateFrom, dateTo)
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
	startYear, startMonth, startDay := event.StartTime.Date()
	endYear, endMonth, endDay := event.EndTime.Date()
	if startYear != endYear || startMonth != endMonth || startDay != endDay {
		return fmt.Errorf("start and end date should be the same")
	}

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
