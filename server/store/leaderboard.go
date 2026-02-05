package store

import "time"

// GetLeaderboard returns the "leaderboard". That is, a list of all the users, groups and the number
// of times that user has signed up for that shift.
func GetLeaderboard(numMonths int) ([]LeaderboardEntry, error) {
	startTime := time.Now().AddDate(0, -numMonths, 0)
	if numMonths == 0 {
		startTime = time.Time{} // zero time
	}

	rows, err := db.Query(`
		SELECT shift_users.user_id, shifts.group_id, COUNT(*) as num_shifts
		FROM shifts
		INNER JOIN shift_users
			ON shift_users.shift_id = shifts.id
		WHERE shifts.date > ?
		GROUP BY shift_users.user_id, shifts.group_id`, startTime.Format(time.DateOnly))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []LeaderboardEntry
	for rows.Next() {
		var entry LeaderboardEntry
		if err := rows.Scan(&entry.UserID, &entry.GroupID, &entry.NumShifts); err != nil {
			continue
		}

		leaderboard = append(leaderboard, entry)
	}
	return leaderboard, nil
}
