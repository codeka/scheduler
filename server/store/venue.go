package store

import (
	"database/sql"
)

func makeVenue(rows *sql.Rows) (*Venue, error) {
	venue := Venue{}
	if err := rows.Scan(&venue.Name, &venue.ShortName, &venue.Address); err != nil {
		return nil, err
	}
	return &venue, nil
}

func GetVenue() (*Venue, error) {
	rows, err := db.Query("SELECT name, short_name, address FROM venue")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		return makeVenue(rows)
	}
	return nil, nil
}

func SaveVenue(venue *Venue) error {
	_, err := db.Exec(`
	    UPDATE venue SET
			  name = ?,
				short_name = ?,
				address = ?`,
		venue.Name, venue.ShortName, venue.Address)
	return err
}
