import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NotificationSetting, User } from "./model";
import { firstValueFrom, map } from "rxjs";
import { ENV } from "../env/environment";

interface SaveProfileResponse {
  success: boolean
}

interface FetchNotificationSettingsResponse {
  notificationSettings: NotificationSetting[]
}

interface SaveNotificationSettingsRequest {
  notificationSettings: NotificationSetting[]
}

interface SaveNotificationSettingsResponse {}

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

  fetchNotificationSettings(): Promise<NotificationSetting[]> {
    return firstValueFrom(
      this.http.get<FetchNotificationSettingsResponse>(ENV.backend + "/_/profile/notifications")
        .pipe(map((resp) => resp.notificationSettings)));
  }

  saveNotificationSettings(settings: NotificationSetting[]): Promise<boolean> {
    const req: SaveNotificationSettingsRequest = {
      notificationSettings: settings,
    }
    return firstValueFrom(
      this.http.post<SaveNotificationSettingsResponse>(ENV.backend + "/_/profile/notifications", req)
          .pipe(map(() => true)))
  }
}
