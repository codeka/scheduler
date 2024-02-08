import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User, Venue } from "./model";
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
}
