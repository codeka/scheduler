import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';
import { stringToDate, stringToTime } from '../util/date.util';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent {
  monthStart = new Date()

  events: Array<Event> = [];

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService,
              private eventsService: EventsService) {
    const today = new Date()
    this.monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all events into the next year, just to make sure we cover ~everything in the future.
    this.eventsService.getEvents(this.monthStart, new Date(today.getFullYear() + 1, 1, 1))
        .then((resp) => {
          this.events = resp.events;
        });
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
}

