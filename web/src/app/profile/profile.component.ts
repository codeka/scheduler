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
  form: FormGroup<{
    name: FormControl<string|null>,
    email: FormControl<string|null>,
    phoneNumber: FormControl<string|null>,
  }>

  private fileInfo: FileInfo|null = null
  user: User

  constructor(
    private formBuilder: FormBuilder, public init: InitService, private profileSerivce: ProfileService,
    private router: Router, public img: ImageService) {

    this.user = init.user()!!

    const phoneNumber = parsePhoneNumberWithError(this.user.phone, 'US')
    this.form = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      email: [this.user.email, Validators.required],
      phoneNumber: [phoneNumber.formatNational()],
    });

    this.form.controls.phoneNumber.valueChanges.subscribe(newValue => {
      const formatted = new AsYouType('US').input(newValue ?? '')
      if (formatted != newValue) {
        this.form.controls.phoneNumber.patchValue(formatted)
      }
    })
  }

  onSaveProfile() {
    this.user.name = this.form.value.name ?? this.user.name
    this.user.email = this.form.value.email ?? this.user.email
    this.user.phone = parsePhoneNumberWithError(this.form.value.phoneNumber ?? this.user.phone, 'US').number

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
  
  imageUpdated(file: FileInfo) {
    this.fileInfo = file
  }
}
