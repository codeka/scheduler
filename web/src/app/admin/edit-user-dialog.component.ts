import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Group, User } from '../services/model';
import { AdminService } from '../services/admin.service';
import { InitService } from '../services/init.service';
import { FileInfo } from '../widgets/image-picker.component';
import { ImageService } from '../services/image.service';
import { confirmAction } from '../widgets/confirm-dialog';

export interface DialogData {
  user?: User
}

@Component({
  selector: 'edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string|null>,
    email: FormControl<string|null>,
    phone: FormControl<string|null>,
    roles: FormControl<string|null>,
    groups: FormArray,
  }>

  allGroups: Array<Group> = []
  fileInfo: FileInfo|null = null

  constructor(private admin: AdminService, private formBuilder: FormBuilder, public init: InitService,
              public img: ImageService, private dialog: MatDialog,
              public dialogRef: MatDialogRef<EditUserDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.allGroups = init.groups()

    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      phone: [""],
      roles: [""],
      groups: this.formBuilder.array([]),
    });

    // Make sure data is non-null.
    if (!this.data) {
      this.data = {}
    }
  }

  public ngOnInit(): void {
    var userGroups = this.data.user?.groups ?? []
    this.groups.clear()
    for (var i = 0; i < this.allGroups.length; i++) {
      var isMember = userGroups.indexOf(this.allGroups[i].id) >= 0
      this.groups.push(this.formBuilder.group({
        groupMembership: [isMember],
      }))
    }

    this.form.patchValue({
      name: this.data.user?.name,
      email: this.data.user?.email,
      phone: this.data.user?.phone,
      roles: (this.data.user?.roles ?? []).join(", "),
      groups: this.data.user?.groups,
    })
  }

  get groups(): FormArray {
    return this.form.controls.groups as FormArray
  }

  get groupsControls(): FormGroup<{groupMembership: FormControl<boolean|null>}>[] {
    return this.form.controls.groups.controls as FormGroup[]
  }

  imageUpdated(file: FileInfo) {
    this.fileInfo = file
  }

  onSave() {
    var roles: Array<string> = []
    for (var roleName of (this.form.value.roles ?? "").split(",")) {
      roles.push(roleName.trim().toUpperCase());
    }

    var groups: Array<number> = []
    this.groupsControls.forEach((ctrl, index) => {
      const isMember = ctrl.value.groupMembership ?? false
      if (isMember) {
        groups.push(this.allGroups[index].id)
      }
    })

    const user: User = {
      id: this.data.user?.id ?? 0,
      name: this.form.value.name ?? "",
      email: this.form.value.email ?? "",
      phone: this.form.value.phone ?? "",
      pictureName: this.data.user?.pictureName ?? "",
      roles: roles,
      groups: groups,
    }

    this.admin.saveUser(user)
      .then(() => {
        if (this.fileInfo != null) {
          this.admin.saveUserPicture(user.id, this.fileInfo.file)
            .then(() => {
              this.dialogRef.close();
            })
        } else {
          this.dialogRef.close();
        }
      })
  }

  onDelete() {
    const userId = this.data.user?.id
    if (!userId) {
      return
    }

    confirmAction(this.dialog, {
        msg: "Are you sure you want to delete this user? Any past shifts the user was a part of will have their name " +
             "<br>replaced with 'Deleted user' and they will no longer be able to sign up for new shifts or log on. " +
             "<br>If create a new user with the same name/email address it will be considered a separate user.",
        title: "Delete User",
        confirmButtonLabel: "DELETE USER"
      }).then(() => {
      this.admin.deleteUser(userId).then(() => {
        // TODO: if there was an error, show it.
        this.dialogRef.close()
        this.ngOnInit();
      })
    })
  }
}
