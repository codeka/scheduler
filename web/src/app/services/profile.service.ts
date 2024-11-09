import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "./model";
import { firstValueFrom, map } from "rxjs";
import { ENV } from "../env/environment";

interface SaveProfileResponse {
  success: boolean
}

// ProfileService is responsible for saving your profile settings (e.g. email address, notification preferences, etc).
@Injectable()
export class ProfileService {

  constructor(private http: HttpClient) {}

  saveProfile(user: User): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveProfileResponse>(ENV.backend + "/_/profile", user)
        .pipe(map(() => true))
    )
  }

  saveProfilePicture(file: File): Promise<boolean> {
    const form = new FormData()
    form.append("picture", file)
    return firstValueFrom(
      this.http.post<SaveProfileResponse>(ENV.backend + "/_/profile/picture", form)
        .pipe(map(() => true))
    )
  }
}
