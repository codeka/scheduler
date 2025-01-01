import { Component, Inject, OnInit } from "@angular/core";
import { FeatureFlag, Group } from "../services/model";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";

export interface DialogData {
  flag?: FeatureFlag
}

@Component({
  selector: 'edit-feature-flag-dialog',
  templateUrl: './edit-feature-flag-dialog.component.html',
  styleUrls: ['./edit-feature-flag-dialog.component.scss']
})
export class EditFeatureFlagDialogComponent implements OnInit {
  form: FormGroup<{
    enabled: FormControl<boolean|null>,
    settings: FormControl<string|null>,
  }>

  constructor(private admin: AdminService, private formBuilder: FormBuilder, private init: InitService,
              private dialog: MatDialog, public dialogRef: MatDialogRef<EditFeatureFlagDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      enabled: [false, Validators.required],
      settings: [""],
    });

    // Make sure data is non-null.
    if (!this.data) {
      this.data = {}
    }
  }

  public ngOnInit(): void {
    this.form.patchValue({
      enabled: this.data.flag?.enabled,
      settings: this.data.flag?.settings == null ? "" : JSON.stringify(this.data.flag?.settings),
    })
  }

  onSave() {
    const settingsJson = this.form.value.settings ?? null
    const settings = (settingsJson == null || settingsJson == "") ? null : JSON.parse(settingsJson)

    const flag: FeatureFlag = {
      flagName: this.data.flag?.flagName || "",
      enabled: this.form.value.enabled ?? false,
      settings: settings,
    }

    this.admin.saveFeatureFlag(flag)
      .then(() => {
        this.dialogRef.close();
      })
  }
}
