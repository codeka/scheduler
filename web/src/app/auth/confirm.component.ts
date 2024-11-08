import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  code = "";
  emailOrPhone = "";
  error = "";

  // Quick regex to validate that what we have looks phone-number-ish.
  private isPhoneNumberExpr = new RegExp("^[0-9\\(\\)\\- \+]+$")

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(map(value => {
      this.onEmailOrPhoneChange(value.get("emailOrPhone") || "")
      this.code = value.get("code") || ""

      if (value.get("action") == "submit") {
        this.onConfirm()
      }
    })).subscribe()
  }

  onEmailOrPhoneChange(newValue: string) {
    if (this.isPhoneNumberExpr.test(newValue)) {
      const formatted = new AsYouType("US").input(newValue)
      this.emailOrPhone = formatted
    } else {
      this.emailOrPhone = newValue
    }
  }

  onConfirm() {
    var identifier = this.emailOrPhone
    if (this.isPhoneNumberExpr.test(identifier)) {
      const phoneNumber = parsePhoneNumber(identifier, "US")
      if (phoneNumber.isValid()) {
        identifier = phoneNumber.number
      }
    }

    this.auth.verifyConfirmation(identifier.trim(), this.code.trim()).then((success: Boolean) => {
      location.href = "/"
    }, (error) => {
      this.error = "Wrong code. Please try again."
    });
  }
}
