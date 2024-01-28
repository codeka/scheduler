import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../services/model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { map } from 'rxjs';

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

  userId = 0

  constructor(private admin: AdminService, private formBuilder: FormBuilder, private route: ActivatedRoute,
              private router: Router) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      mail: ["", Validators.required],
      phone: [""],
      roles: [""],
    });

    this.route.params.pipe(map((p) => {
      if (p["id"]) {
        this.userId = parseInt(p["id"])
        admin.getUser(this.userId).then((user) => {
          this.form.patchValue({
            name: user.name,
            mail: user.mail,
            phone: user.phone,
            roles: (user.roles ??[]).join(", ")
          })
        })
      }
    })).subscribe(() => {});
  }

  onSave() {
    var roles: Array<string> = []
    for (var roleName of (this.form.value.roles ?? "").split(",")) {
      roles.push(roleName.trim().toUpperCase());
    }

    const user: User = {
      id: this.userId,
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
