package flags

import (
	"database/sql"
	"encoding/json"
	"fmt"
)

type FeatureFlag struct {
	Enabled  bool
	Settings map[string]interface{}
}

var mydb *sql.DB

// SendCalendarEvents, if true, we'll send calendar events when people sign up for shifts.
var SendCalendarEvents = FeatureFlag{
	Enabled:  false,
	Settings: nil,
}

// EnableNotifications, if true, we'll send notifications to remind people about their shifts.
var EnableNotifications = FeatureFlag{
	Enabled:  false,
	Settings: nil,
}

// ShowLeaderboard, if true, we'll show the leaderboard feature in the admin section.
var ShowLeaderboard = FeatureFlag{
	Enabled:  false,
	Settings: nil,
}

var AllFlags = map[string]*FeatureFlag{
	"SendCalendarEvents":  &SendCalendarEvents,
	"EnableNotifications": &EnableNotifications,
	"ShowLeaderboard":     &ShowLeaderboard,
}

func UpdateFlag(flagName string, enabled bool, settings map[string]interface{}) error {
	settingsJson, err := json.Marshal(settings)
	if err != nil {
		return err
	}

	for name, flag := range AllFlags {
		if name == flagName {
			_, err := mydb.Exec(`
				UPDATE feature_flags SET
				  enabled = ?,
				  settings = ?
				WHERE flag_name = ?`,
				enabled, string(settingsJson), flagName)
			if err != nil {
				return err
			}

			flag.Enabled = enabled
			flag.Settings = settings
			return nil
		}
	}

	return fmt.Errorf("no such flag: %s", flagName)
}

func Setup(db *sql.DB) error {
	mydb = db

	for name, flag := range AllFlags {
		rows, err := db.Query("SELECT enabled, settings FROM feature_flags WHERE flag_name = ?", name)
		if err != nil {
			return err
		}

		if rows.Next() {
			var settingsJson string
			err = rows.Scan(&flag.Enabled, &settingsJson)
			if err != nil {
				return err
			}
			rows.Close()

			json.Unmarshal([]byte(settingsJson), &flag.Settings)
		} else {
			rows.Close()

			_, err = db.Exec(
				"INSERT INTO feature_flags (flag_name, enabled, settings) VALUES (?, ?, ?)",
				name, flag.Enabled, "")
			if err != nil {
				return err
			}
		}
	}

	return nil
}
