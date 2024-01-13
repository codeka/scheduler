import { Injectable } from "@angular/core";
import { InitService } from "./init.service";
import { User } from "./model";
import { HttpClient } from "@angular/common/http";

import { ENV } from '../env/environment';
import { firstValueFrom, map } from "rxjs";

// When sending the confirmation, this will let you know if we sent it to an email address or a phone number.
export enum SendDestination {
  EMAIL = "EMAIL",
  PHONE = "PHONE"
}

interface ConfirmationSendRequest {
  emailOrPhone: string
}

interface ConfirmationSentResponse {
  destination: SendDestination
}

interface VerifyConfirmationRequest {
  confirmationCode: string
}

interface VerifyConfirmationResponse {
  user: User
  secretKey: string
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

  // Returns true if the currently-logged in user is in the given role.
  isInRole(role: string): boolean {
    if (!this.isLoggedIn()) {
      return false;
    }

    for (const userRole in this.user?.roles) {
      if (role == userRole) {
        return true;
      }
    }
    return false;
  }

  sendConfirmationCode(emailOrPhone: string): Promise<ConfirmationSentResponse> {
    const req: ConfirmationSendRequest = {
      emailOrPhone: emailOrPhone
    };
    return firstValueFrom(
        this.http.post<ConfirmationSentResponse>(ENV.backend + "/_/auth/send-confirmation", req)
      );
  }

  // Verifies that the confirmation is correct. If it is, we save the secret and all subsequent requests (even from
  // different browser sessions) will use it. Returns a boolean success as a promise
  verifyConfirmation(code: string): Promise<Boolean> {
    const req: VerifyConfirmationRequest = {
      confirmationCode: code
    };
    return firstValueFrom(
      this.http.post<VerifyConfirmationResponse>(ENV.backend + "/_/auth/verify-confirmation", req)
          .pipe(map((resp) => {
            if (resp.user.id > 0) {
              console.log("got user: " + JSON.stringify(resp.user));

              // Save the secret key so we can authenticate ourselves later. And save the user so we know we're
              // logged in.
              localStorage.setItem("secretKey", resp.secretKey);
              this.user = resp.user;

              return true;
            } else {
              return false;
            }
          }))
    )
  }
}
