import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { DatePipe } from '@angular/common';

import { EventsService } from "../services/events.service";
import { DashboardMotd, Event } from '../services/model';

import { formatStartEndTime, sameDay, stringToDate, stringToTime } from '../util/date.util';
import { DashboardService } from "../services/dashboard.service";
import { fitTextToBox } from "../util/text-fit";
import { ImageService } from "../services/image.service";
import { InitService } from "../services/init.service";

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
export class DashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  dashboardStartDate = 
      new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
  currentTime = "00:00";
  currentDate = "";
  showColon: boolean = true;
  private _clockIntervalHandle: any = null;

  todaysEvents: Array<Event> = [];
  events: Array<Event> = [];
  months: Array<DashboardMonth> = [];
  motd: DashboardMotd|null = null

  @ViewChild('motdMsg') motdMsgElementRef!: ElementRef;

  constructor(private eventsService: EventsService, private dashboardService: DashboardService,
    private datePipe: DatePipe, public img: ImageService, public init: InitService
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

            if (sameDay(eventDate, this.today)) {
              this.todaysEvents.push(event)
            } else {
              if (currDay == null || !sameDay(currDay.date, eventDate)) {
                currDay = new DashboardDay(eventDate)
                currMonth.days.push(currDay)
              }

              currDay.events.push(event)
            }
          }

          this.months = months
        });

      // Fetch the towards-2030 content
      this.dashboardService.getDashboard()
          .then(response => {
            // Sometimes the response will have some extra tags that we don't want to show.
            const brTagRegex = /(<br\s*\/?>)/gi
            response.motd.messageHtml = response.motd.messageHtml.replace(brTagRegex, ' ')

            // In the final MODT, the last line will end with "From <source>", and we want to style
            // that a little differently. There's no good way to select it, so let's just hack it.
            response.motd.messageHtml =
                response.motd.messageHtml.replace(/(<p\s*\/?>From)/gi, '<p class="from">From')

            this.motd = response.motd
            this.motdMsgElementRef.nativeElement.innerHTML = this.motd.messageHtml;
            fitTextToBox(this.motdMsgElementRef.nativeElement);

            // Start hourly reload of the dashboard page.
            this.startReloadInterval();
            // Start the per-second clock with flashing colon.
            this.startClockInterval();
          });
  }

  // Returns a string that represents the time the given event runs (e.g. "8-9:30am" or "11:30am-12:30pm", etc).
  eventTimeStr(event: Event): string {
    const startTime = stringToTime(event.startTime);
    const endTime = stringToTime(event.endTime);
    return formatStartEndTime(startTime, endTime)
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

  // Handle for hourly page reload.
  private _reloadIntervalHandle: any = null;

  private startReloadInterval(): void {
    // Reload the dashboard page every hour (3600000 ms).
    this._reloadIntervalHandle = setInterval(() => {
      window.location.reload();
    }, 60 * 60 * 1000);
  }

  private startClockInterval(): void {
    // Initialize and toggle colon every second.
    this.updateClock();
    this._clockIntervalHandle = setInterval(() => {
      this.showColon = !this.showColon;
      this.updateClock();
    }, 1000);
  }

  private updateClock(): void {
    const now = new Date();
    // Use DatePipe to format 'HH mm' then plug in ':' or ' ' for flashing effect.
    let formatted = this.datePipe.transform(now, 'hh:mm a') || '00:00';
    formatted = formatted.toLocaleLowerCase();
    this.currentTime = formatted;
    // Set currentDate to a human readable format like "January 11, 2026".
    this.currentDate = this.datePipe.transform(now, 'MMMM d, y') || '';
  }

  ngOnDestroy(): void {
    if (this._reloadIntervalHandle != null) {
      clearInterval(this._reloadIntervalHandle);
      this._reloadIntervalHandle = null;
    }

    if (this._clockIntervalHandle != null) {
      clearInterval(this._clockIntervalHandle);
      this._clockIntervalHandle = null;
    }
  }
}
