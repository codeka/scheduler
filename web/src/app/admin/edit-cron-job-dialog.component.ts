import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { CronJob, Group, User } from '../services/model';
import { AdminService } from '../services/admin.service';
import { InitService } from '../services/init.service';
import { ImageService } from '../services/image.service';
import { confirmAction } from '../widgets/confirm-dialog';

export interface DialogData {
  cronJob?: CronJob
}

@Component({
  selector: 'edit-cron-job-dialog',
  templateUrl: './edit-cron-job-dialog.component.html',
  styleUrls: ['./edit-cron-job-dialog.component.scss']
})
export class EditCronJobDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string|null>,
    schedule: FormControl<string|null>,
    enabled: FormControl<boolean|null>,
  }>

  constructor(private admin: AdminService, private formBuilder: FormBuilder, public init: InitService,
              public img: ImageService, private dialog: MatDialog,
              public dialogRef: MatDialogRef<EditCronJobDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      schedule: ["", Validators.required],
      enabled: [true],
    });

    // Make sure data is non-null.
    if (!this.data) {
      this.data = {}
    }
  }

  public ngOnInit(): void {
    this.form.patchValue({
      name: this.data.cronJob?.name || "",
      schedule: this.data.cronJob?.schedule || "",
      enabled: this.data.cronJob?.enabled || false,
    })
  }

  onSave() {
    const cronJob: CronJob = {
      id: this.data.cronJob?.id ?? 0,
      name: this.form.value.name ?? "",
      schedule: this.form.value.schedule ?? "",
      enabled: this.form.value.enabled ?? false,
      nextRun: null
    }

    this.admin.saveCronJob(cronJob)
      .then(() => {
        this.dialogRef.close();
      })
  }

  onDelete() {
    const cronJobId = this.data.cronJob?.id
    if (!cronJobId) {
      return
    }

    confirmAction(this.dialog, {
        msg: "Are you sure you want to delete this job?",
        title: "Delete Job",
        confirmButtonLabel: "DELETE JOB"
      }).then(() => {
        this.admin.deleteCronJob(cronJobId).then(() => {
          // TODO: if there was an error, show it.
          this.dialogRef.close()
          this.ngOnInit();
        })
      })
  }
}
