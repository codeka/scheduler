import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CronJob, FeatureFlag, Group, NotificationType, User, Venue } from "./model";
import { firstValueFrom, map } from "rxjs";
import { ENV } from "../env/environment";

interface SaveUserResponse {
  success: boolean
}

interface SaveVenueResponse {
  success: boolean
}

interface SaveVenuePictureResponse {
  success: boolean
}

interface GetUsersResponse {
  users: User[]
}

interface GetCronJobsResponse {
  jobs: CronJob[]
}

interface GetNotificationTypesResponse {
  notificationTypes: NotificationType[]
}

// AdminService is responsible for admin functions, listing users, creating users and so on.
@Injectable()
export class AdminService {

  constructor(private http: HttpClient) {}

  // Gets all the users in the data store. All of them.
  // TODO: pagination?
  getUsers(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<GetUsersResponse>(ENV.backend + "/_/admin/users")
        .pipe(map((resp) => resp.users))
    )
  }

  getUser(id: number): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(ENV.backend + "/_/admin/users/" + id)
    )
  }

  saveUser(user: User): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveUserResponse>(ENV.backend + "/_/admin/users", user)
        .pipe(map(() => true))
    )
  }

  deleteUser(userId: number): Promise<boolean> {
    return firstValueFrom(
      this.http.delete<SaveUserResponse>(ENV.backend + "/_/admin/users/" + userId)
        .pipe(map(() => true))
    )
  }

  saveUserPicture(userId: number, file: File): Promise<boolean> {
    const form = new FormData()
    form.append("picture", file)
    return firstValueFrom(
      this.http.post<SaveUserResponse>(ENV.backend + "/_/admin/users/" + userId + "/picture", form)
        .pipe(map(() => true))
    )
  }

  saveVenue(venue: Venue): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveVenueResponse>(ENV.backend + "/_/admin/venue", venue)
        .pipe(map(() => true))
    )
  }

  saveVenuePicture(filename: string, file: File): Promise<boolean> {
    const form = new FormData()
    form.append("picture", file)
    return firstValueFrom(
      this.http.post<SaveVenuePictureResponse>(ENV.backend + "/_/admin/venue/picture", form)
          .pipe(map(() => true))
    )
  }

  saveVenueIcoPicture(filename: string, file: File): Promise<boolean> {
    const form = new FormData()
    form.append("picture", file)
    return firstValueFrom(
      this.http.post<SaveVenuePictureResponse>(ENV.backend + "/_/admin/venue/ico-picture", form)
          .pipe(map(() => true))
    )
  }

  saveVenueSvgPicture(filename: string, file: File): Promise<boolean> {
    const form = new FormData()
    form.append("picture", file)
    return firstValueFrom(
      this.http.post<SaveVenuePictureResponse>(ENV.backend + "/_/admin/venue/svg-picture", form)
          .pipe(map(() => true))
    )
  }

  saveGroup(group: Group): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/admin/groups", group)
          .pipe(map(() => true))
    )
  }

  getCronJobs(): Promise<CronJob[]> {
    return firstValueFrom(
      this.http.get<GetCronJobsResponse>(ENV.backend + "/_/admin/cron-jobs")
        .pipe(map((resp) => resp.jobs))
    )
  }

  saveCronJob(cronJob: CronJob): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/admin/cron-jobs", cronJob)
          .pipe(map(() => true))
    )
  }

  deleteCronJob(id: number): Promise<boolean> {
    return firstValueFrom(
      this.http.delete<any>(ENV.backend + "/_/admin/cron-jobs/" + id)
          .pipe(map(() => true))
    )
  }

  runJob(id: number): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/admin/cron-jobs/" + id + "/run", { /* todo: parameters? */})
          .pipe(map(() => true))
    )
  }
  
  getNotificationTypes(): Promise<NotificationType[]> {
    return firstValueFrom(
      this.http.get<GetNotificationTypesResponse>(ENV.backend + "/_/admin/notifications/types")
        .pipe(map((resp) => resp.notificationTypes))
    )
  }

  saveNotificationType(notificationType: NotificationType): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/admin/notifications/types", notificationType)
          .pipe(map(() => true))
    )
  }

  saveFeatureFlag(flag: FeatureFlag): Promise<boolean> {
    return firstValueFrom(
      this.http.post<any>(ENV.backend + "/_/admin/feature-flags", flag)
          .pipe(map(() => true))
    )
  }
}
