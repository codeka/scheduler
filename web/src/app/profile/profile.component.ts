import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import parsePhoneNumberFromString, { AsYouType, parsePhoneNumberWithError } from "libphonenumber-js";

import { InitService } from "../services/init.service";
import { ImageService } from "../services/image.service";
import { FileInfo } from "../widgets/image-picker.component";
import { ProfileService } from "../services/profile.service";
import { NotificationSetting, User } from "../services/model";

type NotificationSettingFormGroup = FormGroup<{
  notificationId: FormControl<string|null>,
  emailEnabled: FormControl<boolean|null>,
  smsEnabled: FormControl<boolean|null>
}>

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
    shareContactInfo: FormControl<boolean|null>
  }>

  notificationsForm: FormGroup<{
    notifications: FormArray<NotificationSettingFormGroup>
  }>
  allNotifications = new Map<string, string>()
  get notifications(): FormArray<NotificationSettingFormGroup> {
    return this.notificationsForm.controls.notifications
  }
  get notificationsControls(): NotificationSettingFormGroup[] {
    return this.notificationsForm.controls.notifications.controls as NotificationSettingFormGroup[]
  }


  private fileInfo: FileInfo|null = null
  user: User

  constructor(
    private formBuilder: FormBuilder, public init: InitService, private profileService: ProfileService,
    private router: Router, public img: ImageService) {

    this.user = init.user()!!

    const phoneNumber = parsePhoneNumberFromString(this.user.phone, 'US')
    this.profileForm = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      email: [this.user.email, Validators.required],
      phoneNumber: [phoneNumber?.formatNational() ?? ""],
      shareContactInfo: [this.user.shareContactInfo],
    });
    this.notificationsForm = this.formBuilder.group({
      notifications: this.formBuilder.array<NotificationSettingFormGroup>([])
    })

    this.profileForm.controls.phoneNumber.valueChanges.subscribe(newValue => {
      const formatted = new AsYouType('US').input(newValue ?? '')
      if (formatted != newValue) {
        this.profileForm.controls.phoneNumber.patchValue(formatted)
      }
    })

    this.profileService.fetchNotificationSettings().then(
      (notifications) => {
        this.notificationsForm.controls.notifications.clear()
        for (var n of notifications) {
          this.allNotifications.set(n.notificationId, n.notificationDescription ?? "")
          this.notificationsForm.controls.notifications.push(this.formBuilder.group({
            notificationId: [n.notificationId],
            emailEnabled: [n.emailEnabled, Validators.required],
            smsEnabled: [n.smsEnabled, Validators.required],
          }))
        }
      }
    )
  }

  onSaveProfile() {
    this.user.name = this.profileForm.value.name ?? this.user.name
    this.user.email = this.profileForm.value.email ?? this.user.email
    this.user.phone = parsePhoneNumberFromString(this.profileForm.value.phoneNumber ?? this.user.phone, 'US')?.number ?? ""
    this.user.shareContactInfo = this.profileForm.value.shareContactInfo ?? false

    this.profileService.saveProfile(this.user)
      .then(() => {
        if (this.fileInfo != null) {
          this.profileService.saveProfilePicture(this.fileInfo.file)
            .then(() => {
              //??
            })
        } else {
          //??
        }
      })
  }
  
  onSaveNotifications() {
    var settings: Array<NotificationSetting> = []
    this.notificationsControls.forEach((ctrl, index) => {
      const emailEnable = ctrl.value.emailEnabled ?? false
      const smsEnable = ctrl.value.smsEnabled ?? false
      const notificationId = ctrl.value.notificationId ?? ""
      settings.push({
        notificationId: notificationId,
        emailEnabled: emailEnable,
        smsEnabled: smsEnable,
      });
    })

    this.profileService.saveNotificationSettings(settings)
  }

  imageUpdated(file: FileInfo) {
    this.fileInfo = file
  }
}
