import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js';
import { MatCardModule } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatCardModule, MatFormFieldModule, MatIcon, CommonModule, FormsModule, MatButtonModule,
    MatInputModule]
})
export class LoginComponent {
  emailOrPhone = "";
  error = "";

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
      // Most likely the error is either an invalid email/phone number or the user doesn't
      // exist. We'll just give a generic error message.
      this.error = "No user with that phone/email exists."
    });
  }
}

