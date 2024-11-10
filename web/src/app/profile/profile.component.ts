import { Component } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AsYouType, parsePhoneNumberWithError } from "libphonenumber-js";

import { InitService } from "../services/init.service";
import { ImageService } from "../services/image.service";
import { FileInfo } from "../widgets/image-picker.component";
import { ProfileService } from "../services/profile.service";
import { User } from "../services/model";

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profileForm: FormGroup<{
    name: FormControl<string|null>,
    email: FormControl<string|null>,
    phoneNumber: FormControl<string|null>,
  }>

  notificationsForm: FormGroup<{}>

  private fileInfo: FileInfo|null = null
  user: User

  constructor(
    private formBuilder: FormBuilder, public init: InitService, private profileSerivce: ProfileService,
    private router: Router, public img: ImageService) {

    this.user = init.user()!!

    const phoneNumber = parsePhoneNumberWithError(this.user.phone, 'US')
    this.profileForm = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      email: [this.user.email, Validators.required],
      phoneNumber: [phoneNumber.formatNational()],
    });
    this.notificationsForm = this.formBuilder.group({});

    this.profileForm.controls.phoneNumber.valueChanges.subscribe(newValue => {
      const formatted = new AsYouType('US').input(newValue ?? '')
      if (formatted != newValue) {
        this.profileForm.controls.phoneNumber.patchValue(formatted)
      }
    })
  }

  onSaveProfile() {
    this.user.name = this.profileForm.value.name ?? this.user.name
    this.user.email = this.profileForm.value.email ?? this.user.email
    this.user.phone = parsePhoneNumberWithError(this.profileForm.value.phoneNumber ?? this.user.phone, 'US').number

    this.profileSerivce.saveProfile(this.user)
      .then(() => {
        if (this.fileInfo != null) {
          this.profileSerivce.saveProfilePicture(this.fileInfo.file)
            .then(() => {
              //??
            })
        } else {
          //??
        }
      })
  }
  
  onSaveNotifications() {

  }

  imageUpdated(file: FileInfo) {
    this.fileInfo = file
  }
}
