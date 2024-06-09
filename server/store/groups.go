package store

import (
	"database/sql"
	"fmt"
	"log"
)

func makeGroup(row *sql.Rows) (*Group, error) {
	group := &Group{}
	if err := row.Scan(&group.ID, &group.Name, &group.MinSignups); err != nil {
		return nil, err
	}

	return group, nil
}

// GetGroups gets all the groups in the data store.
func GetGroups() ([]*Group, error) {
	rows, err := db.Query(`
			SELECT
				id, name, min_signups
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

func SaveGroup(group *Group) error {
	if group.ID == 0 {
		_, err := db.Query(`
		  INSERT INTO groups (name, min_signups) VALUES (?, ?)`,
			group.Name, group.MinSignups)
		if err != nil {
			return err
		}
	} else {
		_, err := db.Query(`
		  UPDATE groups SET
			  name = ?,
				min_signups = ?
			WHERE id = ?`,
			group.Name, group.MinSignups, group.ID)
		if err != nil {
			return err
		}
	}

	return nil
}
