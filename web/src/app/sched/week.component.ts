import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';
import { stringToDate, stringToTime } from '../util/date.util';
import { EventsService } from '../services/events.service';
import { MatToolbar, MatToolbarModule } from "@angular/material/toolbar";
import { ViewSwitcherComponent } from "./view-switcher.component";
import { CommonModule } from '@angular/common';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss'],
  imports: [MatToolbarModule, ViewSwitcherComponent, CommonModule, MatIconModule, MatButtonModule]
})
export class WeekComponent {
  private date: Observable<Date>;

  days: Observable<Map<Date, Array<Event>>>;
  firstDay: Date;
  lastDay: Date;

  // Used to make the dropdown to select the style default to "weekly"
  weekly = 'weekly';

  hours: Array<number> = [];
  events: Array<Event> = [];

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService,
              private eventsService: EventsService) {
    this.date =
        this.route.params
            .pipe(map((p) => {
              if (!p["year"] || !p["month"] || !p["day"]) {
                const today = new Date();
                // No year/month/day specifed, redirect to today.
                router.navigate(["/week", today.getFullYear(), today.getMonth() + 1, today.getDate()])
              }
              const date = new Date(parseInt(p["year"]), parseInt(p["month"]) - 1, parseInt(p["day"]));
              if (date.getDay() > 0) {
                // If the given date isn't the sunday, conver to the sunday and redirect there.
                date.setDate(date.getDate() - date.getDay());
                router.navigate(["/week", date.getFullYear(), date.getMonth() + 1, date.getDate()])
              }

              // OK, we're good to display this date.
              return date;
            }));

    // Just set them to today for now, we'll update them with the proper values once we parse the params.
    this.firstDay = new Date();
    this.lastDay = new Date();

    this.days = this.date.pipe(map((date) => {
      // The first and last hour we'll display. This is just the default. If there are any events that start/end before
      // or after this, we'll adjust accordingly.
      var firstHour = 7;
      var lastHour = 20;

      const days = new Map<Date, Array<Event>>();
      for (var i = 0; i < 7; i++) {
        const today = new Date(date);
        today.setDate(today.getDate() + i);

        if (i == 0) {
          this.firstDay = today;
        } else if (i == 6) {
          this.lastDay = today;
        }

        days.set(today, new Array<Event>());
      }

      var hours = [];
      for (var i = firstHour; i <= lastHour; i++) {
        hours.push(i);
      }
      this.hours = hours;

      this.eventsService.getEvents(this.firstDay, this.lastDay)
          .then((resp) => {
            this.events = resp.events;
          });

      return days;
    }));
  }

  // We want to pass this to the keyvalue pipe so that it doesn't sort our dates.
  dontSort() {
    return 0;
  }

  eventsForDate(dt: Date): Array<Event> {
    const dateEvents = new Array<Event>();
    if (!this.events) {
      return dateEvents;
    }

    for (const event of this.events) {
      if (stringToDate(event.date).getDate() == dt.getDate()) {
        dateEvents.push(event)
      }
    }
    return dateEvents
  }

  // Returns the y-coordinate of the given time, assuming each hour is hourHeight pixels tall, and we start from
  // this.firstHour.
  eventTop(event: Event, hourHeight: number): string {
    const time = stringToTime(event.startTime);
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

    var str = "" + ((startTime.getHours() > 12) ? startTime.getHours() - 12 : startTime.getHours());
    if (startTime.getMinutes() != 0) {
      str += ":" + ("0" + startTime.getMinutes()).slice(-2);
    }
    if (startTime.getHours() < 12 && endTime.getHours() >= 12) {
      str += "am";
    }
    str += "-";
    if (endTime.getHours() > 12) {
      str += "" + (endTime.getHours() - 12);
    } else {
      str += "" + endTime.getHours();
    }
    if (endTime.getMinutes() != 0) {
      str += ":" + ("0" + endTime.getMinutes()).slice(-2);
    }
    if (endTime.getHours() < 12) {
      str += "am";
    } else {
      str += "pm";
    }

    return str;
  }

  onViewChanged(value: string) {
    if (value == 'daily') {
      this.router.navigate(['day', this.firstDay.getFullYear(), this.firstDay.getMonth() + 1, this.firstDay.getDate()]);
    } else if (value == 'monthly') {
      this.router.navigate(['month', this.firstDay.getFullYear(), this.firstDay.getMonth() + 1]);
    }
  }

  onCreateEvent() {
    this.router.navigate(['edit-event']);
  }

  onCreateShift() {
    this.router.navigate(['edit-shift']);
  }

  onLastWeekClick() {
    const lastWeek = new Date(this.firstDay);
    lastWeek.setDate(lastWeek.getDate() - 7);
    this.router.navigate(['week', lastWeek.getFullYear(), lastWeek.getMonth() + 1, lastWeek.getDate()]);
  }

  onNextWeekClick() {
    const nextWeek = new Date(this.firstDay);
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.router.navigate(['week', nextWeek.getFullYear(), nextWeek.getMonth() + 1, nextWeek.getDate()]);
  }

  onTodayClick() {
    const today = new Date();
    // Make sure we actually navigate to the sunday before today.
    today.setDate(today.getDate() - today.getDay());
    this.router.navigate(['week', today.getFullYear(), today.getMonth() + 1, today.getDate()]);
  }
}

