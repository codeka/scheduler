import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Group, Shift } from '../services/model';
import { EventsService } from '../services/events.service';
import { dateToString, stringToDate, stringToTime, timeToString } from '../util/date.util';
import { InitService } from '../services/init.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { confirmAction } from '../widgets/confirm-dialog';

export interface DialogData {
  shift?: Shift
}

@Component({
  selector: 'edit-shift-dialog',
  templateUrl: './edit-shift-dialog.component.html',
  styleUrls: ['./edit-shift-dialog.component.scss']
})
export class EditShiftDialogComponent implements OnInit {
  form: FormGroup<{
    groupId: FormControl<number|null>,
    date: FormControl<Date|null>,
    startTime: FormControl<Date|null>,
    endTime: FormControl<Date|null>
  }>

  groups: Group[]

  constructor(
      private events: EventsService, private formBuilder: FormBuilder, public init: InitService,
      private dialog: MatDialog, public dialogRef: MatDialogRef<EditShiftDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (!this.data) {
      this.data = {}
    }
    this.form = this.formBuilder.group({
      groupId: [1, Validators.required],
      date: [new Date(), Validators.required],
      startTime: [new Date(1, 1, 1, 10, 0, 0), Validators.required],
      endTime: [new Date(1, 1, 1, 11, 0, 0), Validators.required],
    });
    this.groups = init.groups();
  }

  public ngOnInit(): void {
    this.form.patchValue({
      groupId: this.data.shift?.groupId || 1,
      date: stringToDate(this.data.shift?.date) || new Date(),
      startTime: stringToTime(this.data.shift?.startTime || "10:00"),
      endTime: stringToTime(this.data.shift?.endTime || "11:00"),
    })
  }

  onSave() {
    if (!this.form.value.groupId || !this.form.value.date || !this.form.value.startTime || !this.form.value.endTime) {
      console.log("some values are not set: date=" + this.form.value.date + ", startTime=" + this.form.value.startTime)
      return
    }

    const shift: Shift = {
      id: this.data.shift?.id || 0,
      groupId: this.form.value.groupId,
      date: dateToString(this.form.value.date),
      startTime: timeToString(this.form.value.startTime),
      endTime: timeToString(this.form.value.endTime),
      signups: []
    }

    this.events.saveShift(shift)
      .then(() => {
        this.dialogRef.close(event)
      })
  }

  onDelete() {
    const id = this.data.shift?.id
    if (!id) {
      return
    }

    confirmAction(this.dialog, {
        msg: "Are you sure you want to delete this shift?",
        title: "Delete shift",
        confirmButtonLabel: "DELETE"
      }).then(() => {
      this.events.deleteShift(id).then(success => {
        // TODO: if there was an error, show it.
        this.dialogRef.close()
      })
    })
  }
}


