import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import { ENV } from '../env/environment';

import { Event, Shift, User } from "./model";
import { dateToString } from "../util/date.util";

interface SaveEventResponse {
  success: boolean
}

interface SaveShiftResponse {
  success: boolean
}

export interface GetEventsResponse {
  events: Event[]
  shifts: Shift[]
}

interface GetEligibleUserForShiftResponse {
  users: User[]
}

// EventsService is responsible for fetching, filtering, updating events.
@Injectable()
export class EventsService {

  constructor(private http: HttpClient) {}

  // Gets all the events between the given start and end date (inclusive). We ignore the time in the given start/end
  // date and return all events on those days.
  getEvents(startDate: Date, endDate: Date): Promise<GetEventsResponse> {
    const options = {
      params: new HttpParams()
          .set('startDate', dateToString(startDate))
          .set('endDate', dateToString(endDate))
    };
    return firstValueFrom(
      this.http.get<GetEventsResponse>(ENV.backend + "/_/events", options)
        .pipe(map((resp) => resp))
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

  saveShift(shift: Shift): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveShiftResponse>(ENV.backend + "/_/shifts", shift)
          .pipe(map((resp: SaveShiftResponse) => {
            return resp.success
          }))
        );
  }

  getEligibleUserForShift(shift: Shift, query: string): Promise<User[]> {
    return firstValueFrom(
      this.http.get<GetEligibleUserForShiftResponse>(
        ENV.backend + "/_/shifts/" + shift.id + "/eligible-users?q=" + query)
          .pipe(map((resp: GetEligibleUserForShiftResponse) => {
            return resp.users
          }))
        );
  }
}
