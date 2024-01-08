import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  code = "";

  constructor(private auth: AuthService, private router: Router) {}

  onConfirm() {
    this.auth.verifyConfirmation(this.code)
  }
}
