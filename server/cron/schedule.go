package cron

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"com.codeka/scheduler/server/store"
)

type ScheduleType int

const (
	// Interval schedule type is one that starts with "every". "every 6 hours", "every 2nd day" etc.
	Interval ScheduleType = 0
)

// Schedule represents something that is scheduled. Typically this will be something along the
// lines of "every 6 hours" or "every 10 minutes".
type Schedule struct {
	scheduleType ScheduleType
	duration     time.Duration

	// If specified, we'll run at the given interval, but at the actual specific time given.
	atHour, atMinute, atSecond *int
}

func ParseSchedule(str string) (*Schedule, error) {
	parts := strings.Split(str, " ")
	if parts[0] == "every" {
		if len(parts) >= 3 {
			num := 1
			partIndex := 1
			// We expect it to be something like "every 2nd day" or "every 6 hours"
			snum := parts[partIndex]
			snum = strings.TrimSuffix(snum, "st")
			snum = strings.TrimSuffix(snum, "nd")
			snum = strings.TrimSuffix(snum, "rd")
			snum = strings.TrimSuffix(snum, "th")
			var err error
			num, err = strconv.Atoi(snum)
			if err != nil {
				return nil, err
			}
			partIndex++

			duration := time.Second
			switch parts[partIndex] {
			case "day":
				fallthrough
			case "days":
				duration = time.Hour * 24
			case "hour":
				fallthrough
			case "hours":
				duration = time.Hour
			case "minute":
				fallthrough
			case "minutes":
				duration = time.Minute
			case "second":
				fallthrough
			case "Seconds":
				duration = time.Second
			default:
				return nil, fmt.Errorf("unknown intervalue type '%s' in schedule: %s", parts[2], str)
			}
			partIndex++

			var atHour, atMinute, atSecond *int
			if len(parts) > (partIndex+1) && parts[partIndex] == "at" {
				partIndex++
				atParts := strings.Split(parts[partIndex], ":")
				if len(atParts) == 1 {
					n, err := strconv.Atoi(atParts[0])
					if err != nil {
						return nil, err
					}
					atSecond = &n
				} else if len(atParts) == 2 {
					n, err := strconv.Atoi(atParts[0])
					if err != nil {
						return nil, err
					}
					atMinute = &n
					m, err := strconv.Atoi(atParts[1])
					if err != nil {
						return nil, err
					}
					atSecond = &m
				} else if len(atParts) == 3 {
					n, err := strconv.Atoi(atParts[0])
					if err != nil {
						return nil, err
					}
					atHour = &n
					m, err := strconv.Atoi(atParts[1])
					if err != nil {
						return nil, err
					}
					atMinute = &m
					o, err := strconv.Atoi(atParts[2])
					if err != nil {
						return nil, err
					}
					atSecond = &o
				}
			}

			return &Schedule{Interval, time.Duration(num) * duration, atHour, atMinute, atSecond}, nil
		} else {
			return nil, fmt.Errorf("unexpected number of parts (%d) in interval schedule: %s", len(parts), str)
		}
	} else {
		return nil, fmt.Errorf("unknown schedule: %s", str)
	}
}

func UpdateNextRun(job *store.CronJob) error {
	if !job.Enabled {
		job.NextRun = nil
		return nil
	}

	sched, err := ParseSchedule(job.Schedule)
	if err != nil {
		return err
	}

	nextRun := sched.NextTime(time.Now())
	job.NextRun = &nextRun
	return nil
}

func (s Schedule) String() string {
	switch s.scheduleType {
	case Interval:
		return fmt.Sprintf("every %s", s.duration.String())
	default:
		return "unknown"
	}
}

// NextTime gets the next time this Schedule 'runs' given the current time.
func (s Schedule) NextTime(now time.Time) time.Time {
	switch s.scheduleType {
	case Interval:
		nextTime := now.Add(s.duration)
		if s.atHour != nil {
			nextTime = time.Date(nextTime.Year(), nextTime.Month(), nextTime.Day(), *s.atHour, nextTime.Minute(), nextTime.Second(), 0, nextTime.Location())
		}
		if s.atMinute != nil {
			nextTime = time.Date(nextTime.Year(), nextTime.Month(), nextTime.Day(), nextTime.Hour(), *s.atMinute, nextTime.Second(), 0, nextTime.Location())
		}
		if s.atSecond != nil {
			nextTime = time.Date(nextTime.Year(), nextTime.Month(), nextTime.Day(), nextTime.Hour(), nextTime.Minute(), *s.atSecond, 0, nextTime.Location())
		}
		return nextTime
	default:
		return time.Time{}
	}
}
