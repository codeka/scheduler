import { Component, Inject, OnInit } from "@angular/core";
import { Group } from "../services/model";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";

export interface DialogData {
  group?: Group
}

@Component({
  selector: 'edit-group-dialog',
  templateUrl: './edit-group-dialog.component.html',
  styleUrls: ['./edit-group-dialog.component.scss']
})
export class EditGroupDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string|null>,
    minSignups: FormControl<number|null>,
  }>

  constructor(private admin: AdminService, private formBuilder: FormBuilder, private init: InitService,
              private dialog: MatDialog, public dialogRef: MatDialogRef<EditGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      minSignups: [2, Validators.required],
    });

    // Make sure data is non-null.
    if (!this.data) {
      this.data = {}
    }
  }

  public ngOnInit(): void {
    this.form.patchValue({
      name: this.data.group?.name,
      minSignups: this.data.group?.minSignups,
    })
  }

  onSaveAndClose() {
    this.onSave(true)
  }

  onSave(close: Boolean = false) {
    if (!this.form.value.name || !this.form.value.minSignups) {
      return
    }

    const group: Group = {
      id: this.data.group?.id || 0,
      name: this.form.value.name ?? "",
      minSignups: this.form.value.minSignups ?? 2,
    }

    this.admin.saveGroup(group)
      .then(() => {
        if (close) {
          this.dialogRef.close();
        }
      })
  }

  onDelete() {
    // TODO?
  }
}
