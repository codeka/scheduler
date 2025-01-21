import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, Group, Shift, ShiftSignup } from '../services/model';
import { AuthService } from '../services/auth.service';
import { calculateDuration, calculateOverlap, formatStartEndTime, sameDay, stringToDate, stringToTime } from '../util/date.util';
import { EventsService } from '../services/events.service';
import { InitService } from '../services/init.service';
import { MatDialog } from '@angular/material/dialog';
import { ShiftSignupDialogComponent } from './shift-signup-dialog.component';
import { EditEventDialogComponent } from './edit-event-dialog.component';
import { EditShiftDialogComponent } from './edit-shift-dialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { throttleTime } from 'rxjs/internal/operators/throttleTime';
import { map } from 'rxjs/internal/operators/map';
import { Observable, startWith } from 'rxjs';
import { ViewProfileDialogComponent } from '../profile/view-profile-dialog.component';
import { MailingListDialogComponent } from './mailing-list-dialog.component';

// A shift "bucket" is a collection of shifts that overlap and consitite one set of people. For example, it's common
// to have a bunch of shifts in the morning, then a bunch more in the afternoon. Because shifts are not really
// "associated" with meetings directly (i.e. one shift could cover 2 meetings, etc), this is a way we can group
// associated shifts together.
class ShiftBucket {
  shifts = new Map<number, Array<Shift>>()

  startTime: Date
  endTime: Date

  constructor(initialShift: Shift) {
    this.shifts.set(initialShift.groupId, [initialShift])
    this.startTime = stringToTime(initialShift.startTime)
    this.endTime = stringToTime(initialShift.endTime)
  }

  public addShift(shift: Shift) {
    var shifts = this.shifts.get(shift.groupId)
    if (!shifts) {
      shifts = [shift]
    } else {
      shifts.push(shift)
    }
    this.shifts.set(shift.groupId, shifts)
    const shiftStart = stringToTime(shift.startTime)
    const shiftEnd = stringToTime(shift.endTime)
    this.startTime = (this.startTime.valueOf() < shiftStart.valueOf()) ? this.startTime : shiftStart
    this.endTime = (this.endTime.valueOf() > shiftEnd.valueOf()) ? this.endTime : shiftEnd
  }
}

class ScheduleDay {
  events = new Array<Event>()
  groups = new Array<Group>()
  shifts = new Map<number, Array<Shift>>() // map of string group ID to list of shifts for that group
  shiftBuckets = new Array<ShiftBucket>()

  constructor(public date: Date) {}
}

/** Root of the "schedule" list. We show each month */
class ScheduleMonth {
  days = new Array<ScheduleDay>()

  constructor(public date: Date) {}
}

/**
 * Base class for ScheduleMobileComponent and ScheduleDesktopComponent. We want quite different HTML/layout for the
 * different sized browsers.
 */
@Component({template:''})
export class ScheduleComponent implements OnInit {
  today = new Date()
  // The date we want to start populating the schedule from. Basically, today.
  scheduleStartDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate())

  showAll = false
  events: Array<Event> = []
  months: Array<ScheduleMonth> = []
  groups: Array<Group> = []
  groupMap = new Map<number, Group>()
  useMobileContent: Observable<boolean>

  constructor(public auth: AuthService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router,
              private init: InitService, private eventsService: EventsService) {
    this.refreshGroups();

    // TODO: should this be in some common component?
    const checkScreenSize = () => document.body.offsetWidth < 800;
    const screenSizeChanged = fromEvent(window, 'resize').pipe(throttleTime(500)).pipe(map(checkScreenSize));
    this.useMobileContent = screenSizeChanged.pipe(startWith(checkScreenSize()));
  }

  public ngOnInit(): void {
    // Get all events into the next year, just to make sure we cover ~everything in the future.
    this.eventsService.getEvents(this.scheduleStartDate, new Date(this.today.getFullYear() + 1, 1, 1))
        .then((resp) => {
          this.events = resp.events;

          var months = new Array<ScheduleMonth>()
          var currMonth: ScheduleMonth|null = null
          var currDay: ScheduleDay|null = null
          if (resp.events) for (const event of resp.events) {
            const eventDate = stringToDate(event.date)
            const eventMonth = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
            if (currMonth == null || !sameDay(currMonth.date, eventMonth)) {
              currMonth = new ScheduleMonth(eventMonth)
              months.push(currMonth)
            }

            if (currDay == null || !sameDay(currDay.date, eventDate)) {
              currDay = new ScheduleDay(eventDate)
              currMonth.days.push(currDay)
              currDay.groups = new Array<Group>(...this.init.groups())
            }

            currDay.events.push(event)
            // TODO: add groups
          }

          if (resp.shifts) for (const shift of resp.shifts) {
            const shiftDate = stringToDate(shift.date)
            const shiftStart = stringToTime(shift.startTime)
            const shiftEnd = stringToTime(shift.endTime)
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

            // Figure out if this shift belongs to an existing bucket or not.
            var existingBucket = false
            for (const bucket of day.shiftBuckets) {
              // If the shift overlaps the bucket by more than 3/4 of the shift, then it belongs in this bucket.
              const overlap = calculateOverlap(bucket.startTime, bucket.endTime, shiftStart, shiftEnd)
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

  /**
   * Given a shift, returns a class name that will ensure the shift is colored based on whether the shift is filled
   * or not.
   */
  shiftClass(shift: Shift, group: Group): string {
    if (shift.signups == null) {
      return "shift-empty"
    }

    if (shift.signups.length == 0) {
      return "shift-empty"
    } else if (shift.signups.length < group.minSignups) {
      return "shift-partial"
    } else {
      return "shift-full"
    }
  }

  private refreshGroups() {
    const user = this.init.user()
    this.groups = this.init.groups().filter((group) => {
      return this.showAll || group.alwaysShow || user?.groups.includes(group.id)
    })
    this.groupMap.clear()
    for (const group of this.groups) {
      this.groupMap.set(group.id, group)
    }
  }

  isInGroup(group: Group) {
    return this.init.user()?.groups.includes(group.id) || false
  }

  onShowMailingList(group: Group) {
    this.dialog.open(MailingListDialogComponent, {
      data: { group: group },
    })
  }

  onShowOlder() {
    this.scheduleStartDate = new Date(
        this.scheduleStartDate.getFullYear(),
        this.scheduleStartDate.getMonth() - 1,
        this.scheduleStartDate.getDate())
    this.ngOnInit()
  }

  onShowAllChanged(event: MatCheckboxChange) {
    this.showAll = event.checked
    this.refreshGroups()
  }

  onShiftSignup(group: Group, shift: Shift) {
    const dialogRef = this.dialog.open(ShiftSignupDialogComponent, {
      data: { group: group, shift: shift },
    })
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onSignupClick(group: Group, shift: Shift, signup: ShiftSignup) {
    var canEditSignup = (signup.user.id == this.init.user()?.id)
    canEditSignup ||= this.auth.isInRole("SHIFT_MANAGER") && this.isInGroup(group)
    canEditSignup ||= this.auth.isInRole("ADMIN")
    if (canEditSignup) {
      // If you're allowed to manage this signup, show the signup dialog.
      const dialogRef = this.dialog.open(ShiftSignupDialogComponent, {
        data: { group: group, shift: shift, signup: signup },
      })
      dialogRef.afterClosed().subscribe(result => {
        // Refresh the page.
        this.ngOnInit();
      })
    } else {
      // You cannot edit this sign up, so show the user's profile info instead.
      this.dialog.open(ViewProfileDialogComponent, {
        data: { user: signup.user },
      })
    }
  }

  onEditEvent(event: Event) {
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      data: { event: event },
    })
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onCreateEvent() {
    const dialogRef = this.dialog.open(EditEventDialogComponent)
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onEditShift(shift: Shift) {
    const dialogRef = this.dialog.open(EditShiftDialogComponent, {
      data: { shift: shift },
    })
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onCreateShift() {
    const dialogRef = this.dialog.open(EditShiftDialogComponent)
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }
}

