package store

import "time"

// SaveDashboardMotd saves the given motd to the datastore.
func SaveDashboardMotd(motd *DashboardMotd) error {
	postDate := motd.PostDate.Format(time.DateOnly)

	_, err := db.Exec(`
		DELETE FROM dashboard_motd
		WHERE post_date = ?`,
		postDate)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		INSERT INTO dashboard_motd (post_date, message)
		VALUES (?, ?)`,
		postDate, motd.MessageHTML)
	return err
}

// GetLatestDashboardMotd gets the latest motd from the datastore.
func GetLatestDashboardMotd() (*DashboardMotd, error) {
	row := db.QueryRow(`
		SELECT post_date, message
		FROM dashboard_motd
		ORDER BY post_date DESC
		LIMIT 1`)
	motd := &DashboardMotd{}
	var postDateStr string
	if err := row.Scan(&postDateStr, &motd.MessageHTML); err != nil {
		return nil, err
	}
	var err error
	motd.PostDate, err = time.ParseInLocation(time.DateOnly, postDateStr, time.Local)
	if err != nil {
		return nil, err
	}
	return motd, nil
}
