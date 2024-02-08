import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Group, User } from '../services/model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { map } from 'rxjs';
import { InitService } from '../services/init.service';
import { FileInfo } from '../widgets/image-picker.component';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {
  form: FormGroup<{
    name: FormControl<string|null>,
    email: FormControl<string|null>,
    phone: FormControl<string|null>,
    roles: FormControl<string|null>,
    groups: FormArray,
  }>

  userId = 0
  user?: User
  allGroups: Array<Group> = []
  fileInfo: FileInfo|null = null

  constructor(private admin: AdminService, private formBuilder: FormBuilder, public init: InitService,
              public img: ImageService, private route: ActivatedRoute, private router: Router) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      phone: [""],
      roles: [""],
      groups: this.formBuilder.array([]),
    });
    this.allGroups = init.groups()

    this.route.params.pipe(map((p) => {
      if (p["id"]) {
        this.userId = parseInt(p["id"])
        admin.getUser(this.userId).then((user) => {
          this.user = user

          var userGroups = this.user.groups ?? []
          this.groups.clear()
          for (var i = 0; i < this.allGroups.length; i++) {
            var isMember = userGroups.indexOf(this.allGroups[i].id) >= 0
            this.groups.push(this.formBuilder.group({
              groupMembership: [isMember],
            }))
          }

          this.form.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: (user.roles ??[]).join(", "),
            groups: userGroups,
          })
        })
      }
    })).subscribe(() => {});
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
      id: this.userId,
      name: this.form.value.name ?? "",
      email: this.form.value.email ?? "",
      phone: this.form.value.phone ?? "",
      pictureName: this.user?.pictureName ?? "",
      roles: roles,
      groups: groups,
    }

    this.admin.saveUser(user)
      .then(() => {
        if (this.fileInfo != null) {
          this.admin.saveUserPicture(user.id, this.fileInfo.file)
            .then(() => {
              this.router.navigate(["/users"])
            })
        } else {
          this.router.navigate(["/users"])
        }
      })
  }
}
