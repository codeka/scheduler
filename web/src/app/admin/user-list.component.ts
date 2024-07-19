import { Component, OnInit } from "@angular/core";

import { MatDialog } from "@angular/material/dialog";

import { EditUserDialogComponent } from "./edit-user-dialog.component";
import { User } from "../services/model";
import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { ImageService } from "../services/image.service";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['picture', 'name', 'mail', 'phone', 'roles', 'groups', 'actions'];
  users: User[] = []

  constructor(
    public img: ImageService, private init: InitService, private admin: AdminService, private dialog: MatDialog) { }

  public ngOnInit(): void {
     this.admin.getUsers()
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

  onAddUser() {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '700pt',
    })
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onEditUser(user: User) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '700pt',
      data: { user: user },
    })
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the page.
      this.ngOnInit();
    })
  }
}
