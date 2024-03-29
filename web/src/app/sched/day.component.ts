import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap } from 'rxjs';
import { Event, Group, Shift } from '../services/model';
import { AuthService } from '../services/auth.service';
import { formatStartEndTime, stringToTime } from '../util/date.util';
import { EventsService, GetEventsResponse } from '../services/events.service';
import { InitService } from '../services/init.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent {
  private date: Observable<Date>;
  today = new Date();

  events: Array<Event> = []
  shifts: Array<Shift> = []
  groups: Array<Group>

  // Used to make the dropdown to select the style default to "daily"
  daily = 'daily';

  hours: Array<number> = [];

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService, public img: ImageService,
              public init: InitService, private eventsService: EventsService, initService: InitService) {
    this.groups = initService.groups()
    this.date =
        this.route.params
            .pipe(map((p) => {
              if (!p["year"] || !p["month"] || !p["day"]) {
                const today = new Date();
                // No year/month/day specifed, redirect to today.
                router.navigate(["/week", today.getFullYear(), today.getMonth() + 1, today.getDate()])
              }
              this.today = new Date(parseInt(p["year"]), parseInt(p["month"]) - 1, parseInt(p["day"]));
              return this.today;
            }));

    this.date.pipe(mergeMap((date) => {
      // The first and last hour we'll display. This is just the default. If there are any events that start/end before
      // or after this, we'll adjust accordingly.
      var firstHour = 7;
      var lastHour = 20;

      var hours = [];
      for (var i = firstHour; i <= lastHour; i++) {
        hours.push(i);
      }
      this.hours = hours;

      return this.eventsService.getEvents(date, date)
          .then((data) => {
            this.events = data.events ?? []
            this.shifts = data.shifts ?? []
          })
    })).subscribe(() => {});
  }

  // Returns the y-coordinate of the given time, assuming each hour is hourHeight pixels tall, and we start from
  // this.firstHour.
  timeTop(startTime: string, hourHeight: number): string {
    const time = stringToTime(startTime);
    return (9 + (time.getHours() + (time.getMinutes() / 60.0) - this.hours[0]) * hourHeight) + "pt";
  }

  // Returns the height, in pixels, of an event with the given start and end time.
  timeHeight(startTimeStr: string, endTimeStr: string, hourHeight: number): string {
    const startTime = stringToTime(startTimeStr);
    const endTime = stringToTime(endTimeStr);
    return Math.round(
      ((endTime.getHours() + (endTime.getMinutes() / 60.0)) - (startTime.getHours() + (startTime.getMinutes() / 60.0)))
      * hourHeight) + "pt";
  }

  // Helper to convert an int hour (like 13) to a string (like "1 pm")
  hourStr(hour: number) {
    if (hour < 12) {
      return hour + " am";
    } else if (hour == 12) {
      return "12 pm";
    } else {
      return (hour - 12) + " pm";
    }
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

  shiftsForGroup(groupId: number): Shift[] {
    var shifts = new Array<Shift>();
    for (const shift of this.shifts) {
      if (shift.groupId == groupId) {
        shifts.push(shift)
      }
    }
    return shifts
  }

  hasShiftsForGroup(groupId: number): boolean {
    return this.shiftsForGroup(groupId).length != 0
  }

  onCreateEvent() {
    this.router.navigate(['edit-event']);
  }

  onCreateShift() {
    this.router.navigate(['edit-shift']);
  }

  onYesterdayClick() {
    const yesterday = new Date(this.today);
    yesterday.setDate(yesterday.getDate() - 1);
    this.router.navigate(['day', yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate()]);
  }

  onTomorrowClick() {
    const tomorrow = new Date(this.today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.router.navigate(['day', tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate()]);
  }

  onTodayClick() {
    const today = new Date();
    this.router.navigate(['day', today.getFullYear(), today.getMonth() + 1, today.getDate()]);
  }
}

