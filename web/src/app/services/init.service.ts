import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, tap } from "rxjs";

import { ENV } from '../env/environment';

import { Group, User, Venue } from "./model";

interface InitResponse {
  user: User
  venue: Venue
  groups: Group[]
}

// InitService runs when the app starts up. You can use this to get access to the data we get from the init request.
@Injectable()
export class InitService {
  private initResponse?: InitResponse

  constructor(private http: HttpClient) {}

  // Called as an app initializer. Returns a promise that means the rest of the app won't start until the promise
  // resolves.
  resolve() {
    return (): Promise<any> =>
    firstValueFrom(
      this.http.get<InitResponse>(ENV.backend + "/_/init")
          .pipe(tap((resp: InitResponse) => {
            this.initResponse = resp
          }))
    );
  }

  // Gets the User that we resolved to in the init request. Might be null if we are not logged in.
  user(): User|undefined {
    return this.initResponse?.user
  }

  venue(): Venue {
    return this.initResponse?.venue || { name: "", shortName: "", address: "", pictureName: ""}
  }

  groups(): Group[] {
    return this.initResponse?.groups || [];
  }
}
