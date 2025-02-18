import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, firstValueFrom, map } from "rxjs";

import { ENV } from '../env/environment';

import { Event, Shift, User } from "./model";
import { dateToString } from "../util/date.util";

export interface GetEventsResponse {
  events: Event[]
  shifts: Shift[]
}

interface GetEligibleUserForShiftResponse {
  users: User[]
}

interface GetGroupUsersResponse {
  users: User[]
}

interface SaveEventRequest {
  event: Event,
  initialShifts: Shift[]
}

interface ShiftSignupRequest {
  userId?: number
  notes: string
  sendCalendarEvent: boolean
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
  saveEvent(event: Event, initialShifts: Shift[] = []): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/events",
            { event: event, initialShifts: initialShifts } as SaveEventRequest)
          .pipe(map(() => {
            return true
          }))
          .pipe(catchError(map(() => {
            return false
          })))
        );
  }

  deleteEvent(id: number): Promise<boolean> {
    return firstValueFrom(
      this.http.delete<any>(ENV.backend + "/_/events/" + id)
          .pipe(map(() => {
            return true
          }))
          .pipe(catchError(map(() => {
            return false // todo: there could be a lot of errors here?
          })))
    )
  }

  saveShift(shift: Shift): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/shifts", shift)
          .pipe(map(() => {
            return true
          }))
        );
  }

  deleteShift(shiftId: number): Promise<boolean> {
    return firstValueFrom(
      this.http.delete<any>(ENV.backend + "/_/shifts/" + shiftId)
          .pipe(map(() => {
            return true
          }))
          .pipe(catchError(map(() => {
            return false // todo: there could be a lot of errors here?
          })))
      )
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

  /** Sign up the given user for the given shift. If user is not specified, sign up the current user. */
  shiftSignup(shift: Shift, sendCalendarEvent: boolean, user?: User, notes?: string): Promise<boolean> {
    return firstValueFrom(
      this.http.post(
          ENV.backend + "/_/shifts/" + shift.id + "/signups",
          { userId: user?.id, notes: notes ?? "", sendCalendarEvent } as ShiftSignupRequest)
        .pipe(map(() => {
          return true
        }))
    )
  }

  deleteShiftSignup(shiftId: number, userId: number): Promise<boolean> {
    return firstValueFrom(
      this.http.delete(ENV.backend + "/_/shifts/" + shiftId + "/signups/" + userId)
          .pipe(map(() => { return true; })))
  }

  getGroupUsers(groupId: number): Promise<User[]> {
    return firstValueFrom(
      this.http.get<GetGroupUsersResponse>(ENV.backend + "/_/groups/" + groupId + "/users")
      .pipe(map((resp: GetGroupUsersResponse) => {
        return resp.users
      }))
    )
  }
}
