import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap } from 'rxjs';
import { Event, Group, Shift, ShiftSignup } from '../services/model';
import { AuthService } from '../services/auth.service';
import {
  calculateDuration,
  calculateOverlap,
  formatStartEndTime,
  sameDay,
  stringToDate,
  stringToTime
} from '../util/date.util';
import { EventsService } from '../services/events.service';
import { ShiftBucket } from './shift-bucket';
import { InitService } from '../services/init.service';
import { MatToolbarModule } from "@angular/material/toolbar";
import { ViewSwitcherComponent } from "./view-switcher.component";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EditEventDialogComponent } from './edit-event-dialog.component';
import { EditShiftDialogComponent } from './edit-shift-dialog.component';
import { MatChipsModule } from "@angular/material/chips";
import { ShiftSignupDialogComponent } from './shift-signup-dialog.component';
import { ViewProfileDialogComponent } from '../profile/view-profile-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';


class DayInfo {
  constructor(public date: Date) {}

  events = new Array<Event>()
  shifts = new Map<number, Array<Shift>>() // map of group ID to list of shifts for that group

  private calculateEndTime(eventOrShift: Event|Shift): Date {
    return stringToTime(eventOrShift.endTime)
  }

  // Returns a combined list of events and shifts for this day, sorted by time.
  getEventsAndShifts(): Array<Event|Shift> {
    const combined = new Array<Event|Shift>()
    for (const event of this.events) {
      combined.push(event)
    }
    for (const shiftList of this.shifts.values()) {
      for (const shift of shiftList) {
        combined.push(shift)
      }
    }
    return combined.sort((a, b) => {
      const aEnd = this.calculateEndTime(a)
      const bEnd = this.calculateEndTime(b)
      return aEnd.getTime() - bEnd.getTime()
    })
  }
}

@Component({
  selector: 'month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
  imports: [
      MatToolbarModule, ViewSwitcherComponent, MatIconModule, MatButtonModule, CommonModule,
      MatChipsModule, MatTooltipModule]
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
              private eventsService: EventsService, private init: InitService,
              private dialog: MatDialog) {
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
          console.log("got event: ", event);
          const eventDate = stringToDate(event.date)
          if (currDay == null || !sameDay(currDay.date, eventDate)) {
            console.log("new day for event: ", eventDate);
            currDay = new DayInfo(eventDate)
            days.push(currDay)
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
        }

        this.days = days
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

  shiftTimeStr(shift: Shift): string {
    const startTime = stringToTime(shift.startTime)
    const endTime = stringToTime(shift.endTime)
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
    const dialogRef = this.dialog.open(EditEventDialogComponent)
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.refresh();
    })
  }

  onCreateShift() {
      const dialogRef = this.dialog.open(EditShiftDialogComponent)
      dialogRef.afterClosed().subscribe(() => {
        // Refresh the page.
        this.refresh();
      })
  }

  onEditShift(shift: Shift) {
    const dialogRef = this.dialog.open(EditShiftDialogComponent, {
      data: { shift: shift },
    })
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.refresh();
    })
  }

  getGroup(groupId: number): Group {
    return this.init.groups().find(g => g.id === groupId)!!;
  }

  isEvent(eventOrShift: Event|Shift): eventOrShift is Event {
    return (eventOrShift as Event).title !== undefined;
  }

  isShift(eventOrShift: Event|Shift): eventOrShift is Shift {
    return (eventOrShift as Shift).groupId !== undefined;
  }

  onEventClick(event: Event) {
    // TODO
  }
  onShiftClick(shift: Shift) {
    // TODO
  }

  onShiftSignup(group: Group, shift: Shift) {
    const dialogRef = this.dialog.open(ShiftSignupDialogComponent, {
      data: { group: group, shift: shift },
    })
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the page.
      this.refresh();
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
        this.refresh();
      })
    } else {
      // You cannot edit this sign up, so show the user's profile info instead.
      this.dialog.open(ViewProfileDialogComponent, {
        data: { user: signup.user },
      })
    }
  }

  isInGroup(group: Group) {
    return this.init.user()?.groups.includes(group.id) || false
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

