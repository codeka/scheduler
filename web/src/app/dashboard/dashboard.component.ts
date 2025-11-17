import { Component, OnInit } from "@angular/core";
import { DatePipe } from '@angular/common';

import { InitService } from "../services/init.service";
import { EventsService } from "../services/events.service";
import { DashboardMotd, Event } from '../services/model';

import { formatStartEndTime, sameDay, stringToDate, stringToTime } from '../util/date.util';
import { DashboardService } from "../services/dashboard.service";

class DashboardDay {
  events = new Array<Event>()

  constructor(public date: Date) {}
}

/** Root of the dashboard list. We show each month */
class DashboardMonth {
  days = new Array<DashboardDay>()

  constructor(public date: Date) {}
}

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit {
  today = new Date()
  dashboardStartDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate())

  events: Array<Event> = []
  months: Array<DashboardMonth> = []
  motd: DashboardMotd|null = null

  constructor(private eventsService: EventsService, private dashboardService: DashboardService,
    private datePipe: DatePipe
  ) {}

  public ngOnInit(): void {
    // Get all events into the next year, just to make sure we cover ~everything in the future.
    this.eventsService.getEvents(this.dashboardStartDate, new Date(this.today.getFullYear() + 1, 1, 1))
        .then((resp) => {
          this.events = resp.events;

          var months = new Array<DashboardMonth>()
          var currMonth: DashboardMonth|null = null
          var currDay: DashboardDay|null = null
          if (resp.events) for (const event of resp.events) {
            const eventDate = stringToDate(event.date)
            const eventMonth = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
            if (currMonth == null || !sameDay(currMonth.date, eventMonth)) {
              currMonth = new DashboardMonth(eventMonth)
              months.push(currMonth)
            }

            if (currDay == null || !sameDay(currDay.date, eventDate)) {
              currDay = new DashboardDay(eventDate)
              currMonth.days.push(currDay)
            }

            currDay.events.push(event)
          }

          this.months = months
        });

      // Fetch the towards-2030 content
      this.dashboardService.getDashboard()
          .then(response => {
            this.motd = response.motd;
          })
  }

  // Returns a string that represents the time the given event runs (e.g. "8-9:30am" or "11:30am-12:30pm", etc).
  eventTimeStr(event: Event): string {
    const startTime = stringToTime(event.startTime);
    const endTime = stringToTime(event.endTime);
    return formatStartEndTime(startTime, endTime)
  }

  motdDateStr(motd: DashboardMotd): string {
    console.log(motd.postDate);
    const foo = this.datePipe.transform(motd.postDate, 'MMMM dd, yyyy')
    console.log("foo=" + foo);
    return foo || '';
  }

  // Finds the DashboardDay for the given date, or null if the date doesn't exist.
  findDay(months: Array<DashboardMonth>, date: Date): DashboardDay|null {
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
}
