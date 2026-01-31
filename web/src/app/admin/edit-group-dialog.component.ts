import { Component, Inject, OnInit } from "@angular/core";
import { Group } from "../services/model";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogActions, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";

export interface DialogData {
  group?: Group
}

@Component({
  selector: 'edit-group-dialog',
  templateUrl: './edit-group-dialog.component.html',
  styleUrls: ['./edit-group-dialog.component.scss'],
  imports: [
    MatFormFieldModule, MatCheckboxModule, MatDialogActions, CommonModule, MatButtonModule,
    ReactiveFormsModule, MatIconModule, MatInputModule, MatDialogModule]
})
export class EditGroupDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string|null>,
    minSignups: FormControl<number|null>,
    alwaysShow: FormControl<boolean|null>,
    shiftStartOffset: FormControl<number|null>,
    shiftEndOffset: FormControl<number|null>,
  }>

  constructor(private admin: AdminService, private formBuilder: FormBuilder, private init: InitService,
              private dialog: MatDialog, public dialogRef: MatDialogRef<EditGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      minSignups: [2, Validators.required],
      alwaysShow: [false, Validators.required],
      shiftStartOffset: [0, Validators.required],
      shiftEndOffset: [0, Validators.required],
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
      alwaysShow: this.data.group?.alwaysShow,
      shiftStartOffset: this.data.group?.shiftStartOffset,
      shiftEndOffset: this.data.group?.shiftEndOffset,
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
      alwaysShow: this.form.value.alwaysShow ?? false,
      shiftStartOffset: +(this.form.value.shiftStartOffset ?? 0),
      shiftEndOffset: +(this.form.value.shiftEndOffset ?? 0)
    }
    console.log("always show == " + this.form.value.alwaysShow)

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
