import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Event } from '../services/model';
import { EventsService } from '../services/events.service';
import { Router } from '@angular/router';
import { dateToString, stringToDate, stringToTime, timeToString } from '../util/date.util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { confirmAction } from '../widgets/confirm-dialog';

export interface DialogData {
  event?: Event
}

@Component({
  selector: 'edit-event',
  templateUrl: './edit-event-dialog.component.html',
  styleUrls: ['./edit-event-dialog.component.scss']
})
export class EditEventDialogComponent implements OnInit {
  form: FormGroup<{
    title: FormControl<string|null>,
    description: FormControl<string|null>,
    date: FormControl<Date|null>,
    startTime: FormControl<Date|null>,
    endTime: FormControl<Date|null>
  }>

  constructor(private events: EventsService, private formBuilder: FormBuilder, private router: Router,
              private dialog: MatDialog, public dialogRef: MatDialogRef<EditEventDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this.formBuilder.group({
      title: ["", Validators.required],
      description: [""],
      date: [new Date(), Validators.required],
      startTime: [new Date(1, 1, 1, 10, 0, 0), Validators.required],
      endTime: [new Date(1, 1, 1, 11, 0, 0), Validators.required],
    });

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
      startTime: stringToTime(this.data.event?.startTime || "10:00"),
      endTime: stringToTime(this.data.event?.endTime || "11:00"),
    })
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
        this.ngOnInit();
      })
    })
  }

  onSave() {
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

    this.events.saveEvent(event)
      .then(() => {
        this.dialogRef.close(event)
      })
  }
}