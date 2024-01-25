import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AdminService } from "../services/admin.service";
import { AuthService } from "../services/auth.service";
import { User } from "../services/model";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  displayedColumns: string[] = ['name', 'mail', 'phone', 'roles'];
  users: User[] = []

  constructor(private admin: AdminService, private auth: AuthService, private router: Router) {
    admin.getUsers()
        .then((users) => {
          this.users = users
        })
  }

  onAddUser() {
    // TODO
  }
}
