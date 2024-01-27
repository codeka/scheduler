import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../services/model';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {
  form: FormGroup<{
    name: FormControl<string|null>,
    mail: FormControl<string|null>,
    phone: FormControl<string|null>,
    roles: FormControl<string|null>,
  }>

  constructor(private admin: AdminService, private formBuilder: FormBuilder, private router: Router) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      mail: ["", Validators.required],
      phone: [""],
      roles: [""],
    });
  }

  onSave() {
    var roles: Array<string> = []
    for (var roleName of (this.form.value.roles ?? "").split(",")) {
      roles.push(roleName.trim().toUpperCase());
    }

    const user: User = {
      id: 0, // TODO: if it's an existing user, reuse the ID.
      name: this.form.value.name ?? "",
      mail: this.form.value.mail ?? "",
      phone: this.form.value.phone ?? "",
      roles: roles,
    }

    this.admin.saveUser(user)
      .then(() => {
        // TODO: navigate to the day/week/whatever this event is on.
        this.router.navigate(["/users"])
      })
  }
}
