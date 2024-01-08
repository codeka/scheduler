import { Injectable } from "@angular/core";
import { InitService } from "./init.service";
import { User } from "./model";
import { HttpClient } from "@angular/common/http";

import { ENV } from '../env/environment';
import { firstValueFrom } from "rxjs";

// When sending the confirmation, this will let you know if we sent it to an email address or a phone number.
export enum SendDestination {
  EMAIL = "EMAIL",
  PHONE = "PHONE"
}

interface ConfirmationSendRequest {
  emailOrPhone: string
}

export interface ConfirmationSentResponse {
  destination: SendDestination
}

@Injectable()
export class AuthService {
  private user?: User

  constructor(init: InitService, private http: HttpClient) {
    this.user = init.user()
  }

  isLoggedIn(): boolean {
    return Boolean(this.user)
  }

  sendConfirmationCode(emailOrPhone: string): Promise<ConfirmationSentResponse> {
    const req: ConfirmationSendRequest = {
      emailOrPhone: emailOrPhone
    };
    return firstValueFrom(
        this.http.post<ConfirmationSentResponse>(ENV.backend + "/_/auth/send-confirmation", req)
      );
  }
}
