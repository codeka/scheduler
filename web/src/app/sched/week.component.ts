import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Event } from '../services/model';

@Component({
  selector: 'week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})
export class WeekComponent {
  private date: Observable<Date>;

  days: Observable<Map<Date, Array<Event>>>;

  constructor(private route: ActivatedRoute) {
    this.date =
        this.route.params
            .pipe(map((p) => new Date(parseInt(p["year"]), parseInt(p["month"]) - 1, parseInt(p["day"]))))
            .pipe(map((date) => {
              // Make sure the map is the first day of the week (which is defined as Sunday for us)
              date.setDate(date.getDate() - date.getDay());
              return date;
            }));

    this.days = this.date.pipe(map((date) => {
      const days = new Map<Date, Array<Event>>();
      for (var i = 0; i < 7; i++) {
        const today = new Date(date);
        today.setDate(today.getDate() + i);

        // TODO: fetch events

        days.set(today, new Array<Event>());
      }
      return days;
    }));
  }

  // We want to pass this to the keyvalue pipe so that it doesn't sort our dates.
  dontSort() {
    return 0;
  }
}

