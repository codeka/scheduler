package store

import (
	"database/sql"
)

func makeVenue(rows *sql.Rows) (*Venue, error) {
	venue := Venue{}
	if err := rows.Scan(&venue.Name, &venue.ShortName, &venue.Address, &venue.PictureName, &venue.ShiftsWebAddress, &venue.WebAddress, &venue.VerificationEmailTemplateID); err != nil {
		return nil, err
	}
	return &venue, nil
}

func GetVenue() (*Venue, error) {
	rows, err := db.Query(`
		SELECT name, short_name, address, picture_name,
			   shifts_web_address, web_address, verification_email_template_id
		FROM venue`)
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
				address = ?,
				picture_name = ?,
				shifts_web_address = ?,
				web_address = ?,
				verification_email_template_id = ?`,
		venue.Name, venue.ShortName, venue.Address, venue.PictureName,
		venue.ShiftsWebAddress, venue.WebAddress, venue.VerificationEmailTemplateID)
	return err
}
