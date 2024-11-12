package store

import (
	"fmt"
	"sort"
	"time"
)

// Wrapper type that lets us sort a list of cron jobs by next run time.
type byNextRun []*CronJob

func (jobs byNextRun) Len() int      { return len(jobs) }
func (jobs byNextRun) Swap(i, j int) { jobs[i], jobs[j] = jobs[j], jobs[i] }
func (jobs byNextRun) Less(i, j int) bool {
	if jobs[i].NextRun == nil && jobs[j].NextRun == nil {
		return jobs[i].ID < jobs[j].ID
	}
	if jobs[i].NextRun == nil {
		return true
	}
	if jobs[j].NextRun == nil {
		return false
	}
	return jobs[i].NextRun.Before(*jobs[j].NextRun)
}

// LoadCronJobs returns all cron jobs in the database.
func LoadCrobJobs() ([]*CronJob, error) {
	rows, _ := db.Query("SELECT id, job_name, schedule, enabled, next_run FROM cron")
	defer rows.Close()

	var jobs []*CronJob
	for rows.Next() {
		job := CronJob{}
		var nextRun *string
		if err := rows.Scan(&job.ID, &job.Name, &job.Schedule, &job.Enabled, &nextRun); err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		if nextRun != nil {
			nextRunDate, err := time.Parse(time.RFC3339, *nextRun)
			if err != nil {
				return nil, err
			}
			job.NextRun = &nextRunDate
		}

		jobs = append(jobs, &job)
	}

	sort.Sort(byNextRun(jobs))

	return jobs, nil
}

// LoadCronJob returns a single cron job with the given ID from the database.
func LoadCrobJob(id int64) (*CronJob, error) {
	// TODO: just load the one? loading all and picking it is kind of inefficient, but if there's
	// only a handful, maybe it's not worth the effort to optimize this.
	cronJobs, err := LoadCrobJobs()
	if err != nil {
		return nil, err
	}

	for _, cronJob := range cronJobs {
		if cronJob.ID == id {
			return cronJob, nil
		}
	}
	return nil, fmt.Errorf("no such cron job: %d", id)
}

// Gets the time we need to wait until the next cron job.
func GetTimeToNextCronJob(now time.Time) time.Duration {
	// Even though we store next_run as a string, because it's formatted as RFC3339, it will always be in
	// the correct order such that the right next_run will be picked.
	sql := "SELECT MIN(next_run) FROM cron WHERE enabled = 1"
	row := db.QueryRow(sql)
	var nextRun *string
	err := row.Scan(&nextRun)
	if err != nil || nextRun == nil {
		// There's nothing to run, just pick a random time fairly far in the future. Say, 30 minutes.
		return 30 * time.Minute
	}

	nextRunDate, err := time.Parse(time.RFC3339, *nextRun)
	if err != nil {
		return 30 * time.Minute
	}

	// Return the amount of time we have to wait, not less than a second.
	duration := nextRunDate.Sub(now)
	if duration < time.Second {
		duration = time.Second
	}
	return duration
}

// LoadPendingCronJobs all the cron jobs that are currently scheduled to run now.
func LoadPendingCronJobs(now time.Time) ([]*CronJob, error) {
	jobs, err := LoadCrobJobs()
	if err != nil {
		return nil, err
	}

	var pendingJobs []*CronJob
	for _, job := range jobs {
		if job.Enabled && job.NextRun != nil && job.NextRun.Before(now) {
			pendingJobs = append(pendingJobs, job)
		}
	}

	return pendingJobs, nil
}

// DeleteCronJob deletes the given cron job from the database.
func DeleteCronJob(id int64) error {
	sql := "DELETE FROM cron WHERE id = $1"
	_, err := db.Exec(sql, id)
	return err
}

// SaveCronJob saves the given cron job to the database.
func SaveCronJob(job *CronJob) error {
	var nextRun *string
	if job.Enabled && job.NextRun != nil {
		s := job.NextRun.Format(time.RFC3339)
		nextRun = &s
	}
	if job.ID == 0 {
		sql := "INSERT INTO cron (job_name, schedule, enabled, next_run) VALUES ($1, $2, $3, $4)"
		_, err := db.Exec(sql, job.Name, job.Schedule, job.Enabled, nextRun)
		return err
	} else {
		sql := "UPDATE cron SET job_name=$1, schedule=$2, enabled=$3, next_run=$4 WHERE id=$5"
		_, err := db.Exec(sql, job.Name, job.Schedule, job.Enabled, nextRun, job.ID)
		return err
	}
}
