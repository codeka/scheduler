import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap } from 'rxjs';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';
import { stringToTime } from '../util/date.util';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent {
  private date: Observable<Date>;
  today = new Date();

  events: Observable<Array<Event>>;

  // Used to make the dropdown to select the style default to "daily"
  daily = 'daily';

  hours: Array<number> = [];

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
              this.today = new Date(parseInt(p["year"]), parseInt(p["month"]) - 1, parseInt(p["day"]));
              return this.today;
            }));

    this.events = this.date.pipe(mergeMap((date) => {
      // The first and last hour we'll display. This is just the default. If there are any events that start/end before
      // or after this, we'll adjust accordingly.
      var firstHour = 7;
      var lastHour = 20;

      var hours = [];
      for (var i = firstHour; i <= lastHour; i++) {
        hours.push(i);
      }
      this.hours = hours;

      return this.eventsService.getEvents(date, date);
    }));
  }

  // We want to pass this to the keyvalue pipe so that it doesn't sort our dates.
  dontSort() {
    return 0;
  }

  // Returns the y-coordinate of the given time, assuming each hour is hourHeight pixels tall, and we start from
  // this.firstHour.
  eventTop(event: Event, hourHeight: number): string {
    const time = stringToTime(event.startTime);
    console.log("event.title=" + event.title + " startTime=" + event.startTime);
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

    var str = "" + startTime.getHours();
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

