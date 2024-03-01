import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Group, Shift } from '../services/model';
import { EventsService } from '../services/events.service';
import { Router } from '@angular/router';
import { dateToString, timeToString } from '../util/date.util';
import { InitService } from '../services/init.service';

@Component({
  selector: 'edit-shift',
  templateUrl: './edit-shift.component.html',
  styleUrls: ['./edit-shift.component.scss']
})
export class EditShiftComponent {
  form: FormGroup<{
    groupId: FormControl<number|null>,
    date: FormControl<Date|null>,
    startTime: FormControl<Date|null>,
    endTime: FormControl<Date|null>
  }>

  groups: Group[]

  constructor(
      private events: EventsService, private formBuilder: FormBuilder, public init: InitService,
      private router: Router) {
    this.form = this.formBuilder.group({
      groupId: [1, Validators.required],
      date: [new Date(), Validators.required],
      startTime: [new Date(1, 1, 1, 10, 0, 0), Validators.required],
      endTime: [new Date(1, 1, 1, 11, 0, 0), Validators.required],
    });
    this.groups = init.groups();
  }

  onSave() {
    if (!this.form.value.groupId || !this.form.value.date || !this.form.value.startTime || !this.form.value.endTime) {
      console.log("some values are not set: date=" + this.form.value.date + ", startTime=" + this.form.value.startTime)
      return
    }


    const shift: Shift = {
      id: 0, // TODO: if it's an existing shift, reuse the ID.
      groupId: this.form.value.groupId,
      date: dateToString(this.form.value.date),
      startTime: timeToString(this.form.value.startTime),
      endTime: timeToString(this.form.value.endTime),
      signups: []
    }

    this.events.saveShift(shift)
      .then(() => {
        // TODO: navigate to the day/week/whatever this event is on. Or back where you came from?
        this.router.navigate(["/week/2024/01/09"])
      })
  }
}


