import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap } from 'rxjs';
import { Event, Group, Shift } from '../services/model';
import { AuthService } from '../services/auth.service';
import {
  calculateDuration,
  calculateOverlap,
  dateToString,
  formatStartEndTime,
  sameDay,
  stringToDate,
  stringToTime
} from '../util/date.util';
import { EventsService } from '../services/events.service';
import { ShiftBucket } from './shift-bucket';
import { InitService } from '../services/init.service';


class DayInfo {
  constructor(public date: Date) {}

  events = new Array<Event>()
  groups = new Array<Group>()
  shifts = new Map<number, Array<Shift>>() // map of string group ID to list of shifts for that group
  shiftBuckets = new Array<ShiftBucket>()
}

@Component({
  selector: 'month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss']
})
export class MonthComponent {
  private month: Observable<Date>;
  monthStart = new Date()
  monthEnd = new Date()

  // This array contains the date each week starts. The first one might be negative, 
  weeks: Array<number> = []

  events: Array<Event> = [];
  days: Array<DayInfo> = []

  // Used to make the dropdown to select the style default to "daily"
  monthly = 'monthly';

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService,
              private eventsService: EventsService, private init: InitService) {
    this.month =
        this.route.params
            .pipe(map((p) => {
              if (!p["year"] || !p["month"]) {
                const today = new Date();
                // No year/month specifed, redirect to today.
                router.navigate(["/month", today.getFullYear(), today.getMonth() + 1])
              }
              this.monthStart = new Date(parseInt(p["year"]), parseInt(p["month"]) - 1, 1);

              this.monthEnd = new Date(this.monthStart);
              this.monthEnd.setMonth(this.monthEnd.getMonth() + 1);
              this.monthEnd.setDate(-1);

              var weekStart = -this.monthStart.getDay();
              this.weeks = [];
              while (weekStart <= this.monthEnd.getDate()) {
                this.weeks.push(weekStart);
                weekStart += 7;
              }

              this.refresh();

              return this.monthStart;
            }));
    this.month.subscribe()
  }

  public refresh(): void {
    this.eventsService.getEvents(this.monthStart, this.monthEnd)
      .then((resp) => {
        this.events = resp.events;

        var days = new Array<DayInfo>()
        var currDay: DayInfo|null = null
        if (resp.events) for (const event of resp.events) {
          const eventDate = stringToDate(event.date)
          const eventMonth = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
          if (!sameDay(this.monthStart, eventMonth)) {
            currDay = new DayInfo(eventMonth)
            days.push(currDay)
          }

          if (currDay == null || !sameDay(currDay.date, eventDate)) {
            currDay = new DayInfo(eventDate)
            currDay.groups = new Array<Group>(...this.init.groups())
          }

          currDay.events.push(event)
          // TODO: add groups
        }

        if (resp.shifts) for (const shift of resp.shifts) {
          const shiftDate = stringToDate(shift.date)
          const shiftStart = stringToTime(shift.startTime)
          const shiftEnd = stringToTime(shift.endTime)
          const day = this.findDay(days, shiftDate)
          if (day == null) {
            // It should exist... this is weird. Just ignore it.
            continue
          }

          var shifts = day.shifts.get(shift.groupId)
          if (!shifts) {
            shifts = new Array<Shift>()
            day.shifts.set(shift.groupId, shifts)
          }
          shifts.push(shift)

          // Figure out if this shift belongs to an existing bucket or not.
          var existingBucket = false
          for (const bucket of day.shiftBuckets) {
            // If the shift overlaps the bucket by more than 3/4 of the shift, then it belongs in
            // this bucket.
            const overlap =
                calculateOverlap(bucket.startTime, bucket.endTime, shiftStart, shiftEnd)
            const shiftDuration = calculateDuration(shiftStart, shiftEnd)
            if (overlap > shiftDuration * 0.75) {
              existingBucket = true
              bucket.addShift(shift)
              break
            }
          }
          if (!existingBucket) {
            // Make a new bucket
            day.shiftBuckets.push(new ShiftBucket(shift))
          }
          this.days = days
        }
      });
  }

  // We want to pass this to the keyvalue pipe so that it doesn't sort our dates.
  dontSort() {
    return 0;
  }

  // Finds the ScheduleDay for the given date, or null if the date doesn't exist.
  findDay(days: Array<DayInfo>, date: Date): DayInfo|null {
    for (const day of days) {
      if (day.date.getDate() == date.getDate()) {
        return day
      }
    }
    return null
  }

  eventTimeStr(event: Event): string {
    const startTime = stringToTime(event.startTime);
    const endTime = stringToTime(event.endTime);
    return formatStartEndTime(startTime, endTime)
  }

  findDayInfo(day: number): DayInfo {
    for (const dayInfo of this.days) {
      if (dayInfo.date.getDate() == day) {
        return dayInfo
      }
    }

    // Return an empty DayInfo
    return new DayInfo(new Date(this.monthStart.getFullYear(), this.monthStart.getMonth(), day));
  }

  onCreateEvent() {
    this.router.navigate(['edit-event']);
  }

  onCreateShift() {
    this.router.navigate(['edit-shift']);
  }

  onLastMonthClick() {
    const lastMonth = new Date(this.monthStart);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    this.router.navigate(['month', lastMonth.getFullYear(), lastMonth.getMonth() + 1]);
  }

  onNextMonthClick() {
    const nextMonth = new Date(this.monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.router.navigate(['month', nextMonth.getFullYear(), nextMonth.getMonth() + 1]);
  }

  onTodayClick() {
    const today = new Date();
    this.router.navigate(['month', today.getFullYear(), today.getMonth() + 1]);
  }
}

