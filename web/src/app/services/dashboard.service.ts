import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/internal/operators/map";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";

import { ENV } from "../env/environment";

import { DashboardMotd } from "./model";

interface DashboardResponse {
  motd: DashboardMotd
}

// EventsService is responsible for fetching, filtering, updating events.
@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) {}

  // Gets all the events between the given start and end date (inclusive). We ignore the time in the given start/end
  // date and return all events on those days.
  getDashboard(): Promise<DashboardResponse> {
    return firstValueFrom(
      this.http.get<DashboardResponse>(ENV.backend + "/_/dashboard")
        .pipe(map((resp) => resp))
    )
  }

}
