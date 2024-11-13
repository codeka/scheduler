import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { NotificationType } from '../services/model';
import { AdminService } from '../services/admin.service';
import { InitService } from '../services/init.service';
import { ImageService } from '../services/image.service';

export interface DialogData {
  notificationType?: NotificationType
}

@Component({
  selector: 'edit-notification-type-dialog',
  templateUrl: './edit-notification-type-dialog.component.html',
  styleUrls: ['./edit-notification-type-dialog.component.scss']
})
export class EditNotificationTypeDialogComponent implements OnInit {
  form: FormGroup<{
    description: FormControl<string|null>,
    emailTemplateId: FormControl<string|null>,
    smsTemplate: FormControl<string|null>,
    defaultEmailEnable: FormControl<boolean|null>,
    defaultSmsEnable: FormControl<boolean|null>,
  }>

  constructor(private admin: AdminService, private formBuilder: FormBuilder, public init: InitService,
              public img: ImageService, private dialog: MatDialog,
              public dialogRef: MatDialogRef<EditNotificationTypeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      description: ["", Validators.required],
      emailTemplateId: ["", Validators.required],
      smsTemplate: ["", Validators.required],
      defaultEmailEnable: [false],
      defaultSmsEnable: [false],
    });

    // Make sure data is non-null.
    if (!this.data) {
      this.data = {}
    }
  }

  public ngOnInit(): void {
    this.form.patchValue({
      description: this.data.notificationType?.description || "",
      emailTemplateId: this.data.notificationType?.emailTemplateId || "",
      smsTemplate: this.data.notificationType?.smsTemplate || "",
      defaultEmailEnable: this.data.notificationType?.defaultEmailEnable || false,
      defaultSmsEnable: this.data.notificationType?.defaultSmsEnable || false,
    })
  }

  onSave() {
    const notificationType: NotificationType = {
      id: this.data.notificationType?.id ?? "",
      description: this.form.value.description ?? "",
      emailTemplateId: this.form.value.emailTemplateId ?? "",
      smsTemplate: this.form.value.smsTemplate ?? "",
      defaultEmailEnable: this.form.value.defaultEmailEnable ?? false,
      defaultSmsEnable: this.form.value.defaultSmsEnable ?? false
    }

    this.admin.saveNotificationType(notificationType)
      .then(() => {
        this.dialogRef.close();
      })
  }
}
