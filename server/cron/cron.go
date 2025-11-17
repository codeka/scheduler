package cron

import (
	"context"
	"fmt"
	"log"
	"time"

	"com.codeka/scheduler/server/store"
)

var (
	Jobs map[string]func(context.Context) error
)

func RunCronJob(ctx context.Context, now time.Time, job *store.CronJob) error {
	found := false
	for n, fn := range Jobs {
		if n == job.Name {
			found = true

			err := fn(ctx)
			if err != nil {
				// If there's an error, don't try to run the job again for another 10 minutes.
				nextRun := job.NextRun.Add(10 * time.Minute)
				job.NextRun = &nextRun
				return fmt.Errorf("error running job: %v", err)
			}
		}
	}

	if !found {
		job.Enabled = false
		return fmt.Errorf("job does not exist: %s", job.Name)
	}

	sched, err := ParseSchedule(job.Schedule)
	if err != nil {
		job.Enabled = false
		return fmt.Errorf("job has invalid schedule, cannot reschedule: %w", err)
	}
	nextRun := sched.NextTime(now)
	job.NextRun = &nextRun
	return nil
}

// cronIterate is run in a goroutine to actually execute the cron tasks.
func cronIterate() error {
	ctx := context.Background()

	now := time.Now()
	jobs, err := store.LoadPendingCronJobs(now)
	if err != nil {
		return err
	}

	for _, job := range jobs {
		err := RunCronJob(ctx, now, job)
		if err != nil {
			// Even if there's an error, we'll still re-save the job (the next run, enabled flags and so on will still
			// be updated). But ignore any error saving and return the original.
			_ = store.SaveCronJob(job)
			return err
		} else {
			err := store.SaveCronJob(job)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// runCronIterate is a helper that runs cronIterate and then schedules itself to run again.
func runCronIterate() {
	now := time.Now()
	timeToWait := store.GetTimeToNextCronJob(now)
	if timeToWait > time.Minute {
		// Don't wait more than a minute.
		timeToWait = time.Minute
	}

	log.Printf("Waiting %v to next cron job", timeToWait)
	time.Sleep(timeToWait)

	err := cronIterate()
	if err != nil {
		log.Printf("Error running cronIterate: %v", err)
		// Keep going, schedule again.
	}

	// Schedule to run again.
	go runCronIterate()
}

// Gets a list of the cron job names.
func GetCronJobNames() []string {
	var names []string
	for k := range Jobs {
		names = append(names, k)
	}
	return names
}

func Setup() error {
	Jobs = make(map[string]func(context.Context) error)
	Jobs["send-reminders"] = cronSendReminders
	Jobs["fetch-towards2030"] = cronFetchTowards2030

	// Run the cron goroutine start away.
	go runCronIterate()

	return nil
}
