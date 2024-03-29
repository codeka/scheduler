import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, Group, Shift } from '../services/model';
import { AuthService } from '../services/auth.service';
import { formatStartEndTime, sameDay, stringToDate, stringToTime } from '../util/date.util';
import { EventsService } from '../services/events.service';
import { InitService } from '../services/init.service';
import { MatDialog } from '@angular/material/dialog';
import { ShiftSignupDialogComponent } from './shift-signup-dialog.component';

class ScheduleDay {
  events = new Array<Event>()
  groups = new Array<Group>()
  shifts = new Map<number, Array<Shift>>() // map of string group ID to list of shifts for that group

  constructor(public date: Date) {}
}

/** Root of the "schedule" list. We show each month */
class ScheduleMonth {
  days = new Array<ScheduleDay>()

  constructor(public date: Date) {}
}

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent {
  monthStart = new Date()

  events: Array<Event> = []
  months: Array<ScheduleMonth> = []
  groups: Array<Group> = []

  constructor(public auth: AuthService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router,
              private init: InitService, private eventsService: EventsService) {
    const today = new Date()
    this.monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    this.groups = init.groups()

    // Get all events into the next year, just to make sure we cover ~everything in the future.
    this.eventsService.getEvents(this.monthStart, new Date(today.getFullYear() + 1, 1, 1))
        .then((resp) => {
          this.events = resp.events;

          var months = new Array<ScheduleMonth>()
          var currMonth: ScheduleMonth|null = null
          var currDay: ScheduleDay|null = null
          for (const event of resp.events) {
            const eventDate = stringToDate(event.date)
            const eventMonth = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
            if (currMonth == null || !sameDay(currMonth.date, eventMonth)) {
              currMonth = new ScheduleMonth(eventMonth)
              months.push(currMonth)
            }

            if (currDay == null || !sameDay(currDay.date, eventDate)) {
              currDay = new ScheduleDay(eventDate)
              currMonth.days.push(currDay)
              currDay.groups = new Array<Group>(...init.groups())
            }

            currDay.events.push(event)
            // TODO: add groups
          }

          for (const shift of resp.shifts) {
            const shiftDate = stringToDate(shift.date)
            const day = this.findDay(months, shiftDate)
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
          }
          this.months = months
        });
  }

  // Finds the ScheduleDay for the given date, or null if the date doesn't exist.
  findDay(months: Array<ScheduleMonth>, date: Date): ScheduleDay|null {
    for (const month of months) {
      if (month.date.getMonth() == date.getMonth()) {
        for (const day of month.days) {
          if (day.date.getDate() == date.getDate()) {
            return day
          }
        }
      }
    }
    return null
  }

  // Returns a string that represents the time the given event runs (e.g. "8-9:30am" or "11:30am-12:30pm", etc).
  eventTimeStr(event: Event): string {
    const startTime = stringToTime(event.startTime);
    const endTime = stringToTime(event.endTime);
    return formatStartEndTime(startTime, endTime)
  }

  shiftTimeStr(shift: Shift): string {
    const startTime = stringToTime(shift.startTime)
    const endTime = stringToTime(shift.endTime)
    return formatStartEndTime(startTime, endTime)
  }

  eventsForDay(day: number): Array<Event> {
    const dateEvents = new Array<Event>();
    if (!this.events) {
      return dateEvents;
    }

    for (const event of this.events) {
      if (stringToDate(event.date).getDate() == day) {
        dateEvents.push(event)
      }
    }
    return dateEvents
  }

  onShiftSignup(group: Group, shift: Shift) {
    const dialogRef = this.dialog.open(ShiftSignupDialogComponent, {
      data: { group: group, shift: shift },
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log("dialog closed: " + result)
    })
  }

  onCreateEvent() {
    this.router.navigate(['edit-event']);
  }

  onCreateShift() {
    this.router.navigate(['edit-shift']);
  }
}

