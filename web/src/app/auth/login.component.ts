import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  emailOrPhone = "";

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.sendConfirmationCode(this.emailOrPhone).then(resp => {
      console.log(resp.destination);
      this.router.navigate(["/login/confirm"]);
    }, (error) => {
      // TODO: handle errors better.
      console.log("error: " + JSON.stringify(error));
    });
  }
}

