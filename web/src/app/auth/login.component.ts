import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  emailOrPhone = "";

  // Quick regex to validate that what we have looks phone-number-ish.
  private isPhoneNumberExpr = new RegExp("^[0-9\\(\\)\\- \+]+$")

  constructor(private auth: AuthService, private router: Router) {}

  onEmailOrPhoneChange(newValue: string) {
    if (this.isPhoneNumberExpr.test(newValue)) {
      const formatted = new AsYouType("US").input(newValue)
      this.emailOrPhone = formatted
    } else {
      this.emailOrPhone = newValue
    }
  }

  onLogin() {
    var identifier = this.emailOrPhone
    if (this.isPhoneNumberExpr.test(identifier)) {
      const phoneNumber = parsePhoneNumber(identifier, "US")
      if (phoneNumber.isValid()) {
        identifier = phoneNumber.number
      }
    }

    this.auth.sendConfirmationCode(identifier).then(resp => {
      this.router.navigate(["/login/confirm"], {queryParams: {emailOrPhone: this.emailOrPhone}});
    }, (error) => {
      // TODO: handle errors better.
      console.log("error: " + JSON.stringify(error));
    });
  }
}

