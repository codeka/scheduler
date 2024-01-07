import { Injectable } from "@angular/core";
import { InitService } from "./init.service";
import { User } from "./model";

@Injectable()
export class AuthService {
  private user?: User

  constructor(init: InitService) {
    this.user = init.user()
  }

  isLoggedIn(): boolean {
    return Boolean(this.user)
  }
}
