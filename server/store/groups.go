package store

import (
	"database/sql"
	"fmt"
	"log"
)

func makeGroup(row *sql.Rows) (*Group, error) {
	group := &Group{}
	if err := row.Scan(&group.ID, &group.Name); err != nil {
		return nil, err
	}

	return group, nil
}

// GetGroups gets all the groups in the data store.
func GetGroups() ([]*Group, error) {
	rows, err := db.Query(`
			SELECT
				id, name
			FROM groups`)
	if err != nil {
		return nil, fmt.Errorf("error querying events in date range: %v", err)
	}
	defer rows.Close()

	var groups []*Group
	for rows.Next() {
		group, err := makeGroup(rows)
		if err != nil {
			// TODO: this is a bad error, notify the devs?
			log.Printf("Error exracting group! %v", err)
			continue
		}
		groups = append(groups, group)
	}
	return groups, nil
}
