import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, tap } from "rxjs";

import { ENV } from '../env/environment';

import { FeatureFlag, Group, User, Venue } from "./model";

interface InitResponse {
  user: User
  venue: Venue
  groups: Group[]
  featureFlags: FeatureFlag[]
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
    return this.initResponse?.venue || {
      name: "",
      shortName: "",
      address: "",
      pictureName: "", 
      icoPictureName: "",
      svgPictureName: "",
      shiftsWebAddress: "",
      webAddress: "",
      verificationEmailTemplateId: "",
      mapName: "",
    }
  }

  groups(): Group[] {
    return this.initResponse?.groups || [];
  }

  allFeatureFlags(): FeatureFlag[] {
    return this.initResponse?.featureFlags || []
  }

  flag(name: string): FeatureFlag {
    const emptyFlag = {flagName: name, enabled: false, settings: null};
    const allFlags = this.initResponse?.featureFlags
    if (!allFlags) {
      return emptyFlag;
    }

    for (const flag of allFlags) {
      if (flag.flagName == name) {
        return flag
      }
    }

    return emptyFlag
  }
}
