import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';

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

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService) {
    this.date =
        this.route.params
            .pipe(map((p) => new Date(parseInt(p["year"]), parseInt(p["month"]) - 1, parseInt(p["day"]))))
            .pipe(map((date) => {
              // Make sure the map is the first day of the week (which is defined as Sunday for us)
              date.setDate(date.getDate() - date.getDay());
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

        // TODO: fetch events

        days.set(today, new Array<Event>());
      }

      this.hours = [];
      for (var hour = firstHour; i <= lastHour; i++) {
        this.hours.push(i);
      }

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
}

