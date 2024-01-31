import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AdminService } from "../services/admin.service";
import { AuthService } from "../services/auth.service";
import { User } from "../services/model";
import { InitService } from "../services/init.service";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  displayedColumns: string[] = ['name', 'mail', 'phone', 'roles', 'groups', 'actions'];
  users: User[] = []

  constructor(private admin: AdminService, private auth: AuthService, private init: InitService,
              private router: Router) {
    admin.getUsers()
        .then((users) => {
          this.users = users
        })
  }

  groupsAsString(groups: number[]) {
    var groupsStrings: Array<string> = []
    for (var group of this.init.groups()) {
      for (var id of groups) {
        if (id == group.id) {
          groupsStrings.push(group.name)
        }
      }
    }

    return groupsStrings.join(", ")
  }
}
