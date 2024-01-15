import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import { ENV } from '../env/environment';

import { Event } from "./model";

interface SaveEventResponse {
  success: boolean
}

// EventsService is responsible for fetching, filtering, updating events.
@Injectable()
export class EventsService {

  constructor(private http: HttpClient) {}

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
