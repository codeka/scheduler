package store

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

func makeGroup(row *sql.Rows) (*Group, error) {
	group := &Group{}
	shiftBeginOffsetMin := 0.0
	shiftEndOffsetMin := 0.0

	if err := row.Scan(
		&group.ID, &group.Name, &group.MinSignups, &group.AlwaysShow, &shiftBeginOffsetMin, &shiftEndOffsetMin); err != nil {
		return nil, err
	}

	group.ShiftStartOffset = time.Duration(shiftBeginOffsetMin * float64(time.Minute))
	group.ShiftEndOffset = time.Duration(shiftEndOffsetMin * float64(time.Minute))

	return group, nil
}

// GetGroup returns the group with the given ID.
func GetGroup(groupID int64) (*Group, error) {
	groups, err := GetGroups()
	if err != nil {
		return nil, err
	}

	for _, group := range groups {
		if group.ID == groupID {
			return group, nil
		}
	}

	return nil, fmt.Errorf("no such group %d", groupID)
}

// GetGroups gets all the groups in the data store.
func GetGroups() ([]*Group, error) {
	rows, err := db.Query(`
			SELECT
				id, name, min_signups, always_show, shift_begin_offset_min, shift_end_offset_min
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
		  INSERT INTO groups (name, min_signups, always_show, shift_begin_offset_min, shift_end_offset_min) VALUES (?, ?, ?, ?, ?)`,
			group.Name, group.MinSignups, group.AlwaysShow, group.ShiftStartOffset.Minutes(), group.ShiftEndOffset.Minutes())
		if err != nil {
			return err
		}
	} else {
		_, err := db.Query(`
		  UPDATE groups SET
			  name = ?,
				min_signups = ?,
				always_show = ?,
				shift_begin_offset_min = ?,
				shift_end_offset_min = ?
			WHERE id = ?`,
			group.Name, group.MinSignups, group.AlwaysShow, group.ShiftStartOffset.Minutes(), group.ShiftEndOffset.Minutes(),
			group.ID)
		if err != nil {
			return err
		}
	}

	return nil
}
