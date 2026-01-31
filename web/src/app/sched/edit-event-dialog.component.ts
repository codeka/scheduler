import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Event, Group, Shift } from '../services/model';
import { EventsService } from '../services/events.service';
import { Router } from '@angular/router';
import { dateToString, stringToDate, stringToTime, timeToString } from '../util/date.util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { confirmAction } from '../widgets/confirm-dialog';
import { InitService } from '../services/init.service';
import { MatFormField, MatLabel, MatHint, MatSelect, MatOption, MatSelectModule } from "@angular/material/select";
import { MatDatepickerToggle, MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { TimeInputComponent } from "../widgets/time-input.component";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { DateAdapter, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
  event?: Event
}

type ShiftFormGroup = FormGroup<{
  groupId: FormControl<number|null>,
  startTime: FormControl<Date|null>,
  endTime: FormControl<Date|null>,
}>

type EventFormGroup = FormGroup<{
  title: FormControl<string|null>,
  description: FormControl<string|null>,
  date: FormControl<Date|null>,
  startTime: FormControl<Date|null>,
  endTime: FormControl<Date|null>,
  initialShifts: FormArray<ShiftFormGroup>,
}>

@Component({
  selector: 'edit-event-dialog',
  templateUrl: './edit-event-dialog.component.html',
  styleUrls: ['./edit-event-dialog.component.scss'],
  imports: [
    MatDialogModule, MatFormFieldModule, MatDatepickerModule, TimeInputComponent, MatSelectModule,
    MatOptionModule, MatIconModule, ReactiveFormsModule, MatNativeDateModule, MatButtonModule,
    MatInputModule, FormsModule, CommonModule,  MatDialogActions
]
})
export class EditEventDialogComponent implements OnInit {
  form: EventFormGroup

  groups: Group[]

  constructor(private events: EventsService, private formBuilder: FormBuilder, private router: Router,
              private init: InitService,
              private dialog: MatDialog, public dialogRef: MatDialogRef<EditEventDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      title: ["", Validators.required],
      description: [""],
      date: [new Date(), Validators.required],
      startTime: [new Date(1, 1, 1, 10, 0, 0), Validators.required],
      endTime: [new Date(1, 1, 1, 11, 0, 0), Validators.required],
      initialShifts: this.formBuilder.array(new Array<ShiftFormGroup>()),
    });
    this.groups = init.groups();

    // Make sure data is non-null.
    if (!this.data) {
      this.data = {}
    }
  }

  public ngOnInit(): void {
    this.form.patchValue({
      title: this.data.event?.title,
      description: this.data.event?.description,
      date: stringToDate(this.data.event?.date) || new Date(),
      startTime: stringToTime(this.data.event?.startTime || "10:00:00"),
      endTime: stringToTime(this.data.event?.endTime || "11:00:00"),
    })

    if (this.data.event === undefined) {
      for (const group of this.init.groups()) {
        this.addShift(group.id)
      }
    }

    this.updateShiftTimes()
  }

  addShift(groupId: number) {
    const startTime = stringToTime(this.data.event?.startTime || "10:00:00")
    const endTime = stringToTime(this.data.event?.endTime || "11:00:00")

    const shiftForm = this.formBuilder.group({
      groupId: [groupId, Validators.required],
      // TODO: offset start/end time with some default offset per-group.
      startTime: [startTime, Validators.required],
      endTime: [endTime, Validators.required],
    })
    this.form.controls.initialShifts.controls.push(shiftForm)
    this.form.controls.initialShifts.markAsDirty()
  }

  deleteShiftAt(index: number) {
    this.form.controls.initialShifts.controls.splice(index, 1)
    this.form.controls.initialShifts.markAsDirty()
  }

  shiftControls(): ShiftFormGroup[] {
    return this.form.controls.initialShifts.controls as ShiftFormGroup[]
  }

  updateShiftTimes() {
    const startTime = this.form.controls.startTime.value ?? new Date()
    const endTime = this.form.controls.endTime.value ?? new Date()

    for (var i = 0; i < this.form.controls.initialShifts.length; i++) {
      const shiftControls = this.form.controls.initialShifts.at(i).controls
      const groupId = shiftControls.groupId.value
      for (var group of this.init.groups()) {
        if (group.id == groupId) {
          var shiftStartTime = new Date(startTime)
          shiftStartTime.setMinutes(endTime.getMinutes() + (group.shiftStartOffset * 60.0))
          var shiftEndTime = new Date(endTime)
          shiftEndTime.setMinutes(endTime.getMinutes() + (group.shiftEndOffset * 60.0))
          shiftControls.startTime.patchValue(shiftStartTime)
          shiftControls.endTime.patchValue(shiftEndTime)
        }
      }
    }
  }

  onDelete() {
    const id = this.data.event?.id
    if (!id) {
      return
    }

    confirmAction(this.dialog, {
        msg: "Are you sure you want to delete this event?",
        title: "Delete event",
        confirmButtonLabel: "DELETE"
      }).then(() => {
      this.events.deleteEvent(id).then(success => {
        // TODO: if there was an error, show it.
        this.dialogRef.close()
      })
    })
  }

  onSaveAndClose() {
    this.onSave(true)
  }

  onSave(close: Boolean = false) {
    if (!this.form.value.date || !this.form.value.startTime || !this.form.value.endTime || !this.form.value.title) {
      console.log("some values are not set: date=" + this.form.value.date + ", startTime=" + this.form.value.startTime)
      return
    }

    const event: Event = {
      id: this.data.event?.id || 0,
      title: this.form.value.title ?? "",
      description: this.form.value.description ?? "",
      date: dateToString(this.form.value.date),
      startTime: timeToString(this.form.value.startTime),
      endTime: timeToString(this.form.value.endTime),
    }

    const initialShifts: Shift[] = [];
    for (var i = 0; i < this.form.controls.initialShifts.length; i++) {
      const shiftValue = this.form.controls.initialShifts.at(i).value
      initialShifts.push({
        id: 0,
        groupId: shiftValue.groupId || 0,
        date: dateToString(this.form.value.date),
        startTime: timeToString(shiftValue.startTime || new Date()),
        endTime: timeToString(shiftValue.endTime || new Date()),
        signups: []
      })
    }

    this.events.saveEvent(event, initialShifts)
      .then(() => {
        if (close) {
          this.dialogRef.close(event)
        }
      })
  }
}
