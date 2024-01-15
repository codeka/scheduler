import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import { ENV } from '../env/environment';

import { Event } from "./model";

// When we send events to the/from the sever, we need to translate the dates into strings, otherwise
// Angular sends them as UTC dates, but we want all the dates to be in local times.
interface JsonEvent {
  id: number,
  title: string,
  descript: string,
  startTime: string,
  endTime: string,
}

interface SaveEventResponse {
  success: boolean
}

// Formats a Date as "yyyy-mm-dd HH:mm:ss" in the local timezone,
function formatDateTime(dt: Date): string {
  let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dt);
  let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(dt);
  let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dt);
  let hour = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(dt);
  let minute = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(dt);
  let second = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(dt);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

function toJsonEvent(event: Event): JsonEvent {
  return {
    id: event.id,
    title: event.title,
    descript: event.description,
    startTime: formatDateTime(event.startTime),
    endTime: formatDateTime(event.endTime),
  }
}

// EventsService is responsible for fetching, filtering, updating events.
@Injectable()
export class EventsService {

  constructor(private http: HttpClient) {}

  // Called as an app initializer. Returns a promise that means the rest of the app won't start until the promise
  // resolves.
  saveEvent(event: Event): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveEventResponse>(ENV.backend + "/_/events", toJsonEvent(event))
          .pipe(map((resp: SaveEventResponse) => {
            return resp.success
          }))
        );
  }
}
