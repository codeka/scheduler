import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "./model";
import { firstValueFrom, map } from "rxjs";
import { ENV } from "../env/environment";

interface SaveUserResponse {
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

  saveUser(user: User): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SaveUserResponse>(ENV.backend + "/_/admin/users", user)
        .pipe(map((resp) => resp.success))
    )
  }
}
