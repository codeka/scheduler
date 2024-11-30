import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, mergeMap } from 'rxjs';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';
import { dateToString, formatStartEndTime, stringToDate, stringToTime } from '../util/date.util';
import { EventsService } from '../services/events.service';

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

  // Used to make the dropdown to select the style default to "daily"
  monthly = 'monthly';

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService,
              private eventsService: EventsService) {
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

              this.eventsService.getEvents(this.monthStart, this.monthEnd)
                .then((resp) => {
                  this.events = resp.events;
                });

              return this.monthStart;
            }));
    this.month.subscribe()
  }

  // We want to pass this to the keyvalue pipe so that it doesn't sort our dates.
  dontSort() {
    return 0;
  }

  eventTimeStr(event: Event): string {
    const startTime = stringToTime(event.startTime);
    const endTime = stringToTime(event.endTime);
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

