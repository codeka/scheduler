import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AdminService } from "../services/admin.service";
import { AuthService } from "../services/auth.service";
import { User } from "../services/model";
import { InitService } from "../services/init.service";
import { ImageService } from "../services/image.service";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  displayedColumns: string[] = ['picture', 'name', 'mail', 'phone', 'roles', 'groups', 'actions'];
  users: User[] = []

  constructor(public img: ImageService, private init: InitService, admin: AdminService) {
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
