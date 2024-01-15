import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';
import { dateToString } from '../util/date.util';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})
export class WeekComponent {
  private date: Observable<Date>;

  days: Observable<Map<Date, Array<Event>>>;
  firstDay: Date;
  lastDay: Date;

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
          .then((events) => {
            this.events = events;
          });

      return days;
    }));
  }

  // We want to pass this to the keyvalue pipe so that it doesn't sort our dates.
  dontSort() {
    return 0;
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

  onCreateEvent() {
    this.router.navigate(['edit-event']);
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

