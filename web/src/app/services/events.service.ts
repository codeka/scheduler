import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import { ENV } from '../env/environment';

import { Event } from "./model";
import { dateToString } from "../util/date.util";

interface SaveEventResponse {
  success: boolean
}

// EventsService is responsible for fetching, filtering, updating events.
@Injectable()
export class EventsService {

  constructor(private http: HttpClient) {}

  // Gets all the events between the given start and end date (inclusive). We ignore the time in the given start/end
  // date and return all events on those days.
  getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    const options = {
      params: new HttpParams()
          .set('startDate', dateToString(startDate))
          .set('endDate', dateToString(endDate))
    };
    return firstValueFrom(
      this.http.get<Event[]>(ENV.backend + "/_/events", options)
    )
  }

  // Called as an app initializer. Returns a promise that means the rest of the app won't start until the promise
  // resolves.
  saveEvent(event: Event): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveEventResponse>(ENV.backend + "/_/events", event)
          .pipe(map((resp: SaveEventResponse) => {
            return resp.success
          }))
        );
  }
}
