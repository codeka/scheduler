import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  form: FormGroup

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
    const startTime = new Date(this.form.value.startTime);
    const endTime = new Date(this.form.value.endTime);

    const shift: Shift = {
      id: 0, // TODO: if it's an existing event, reuse the ID.
      groupId: this.form.value.groupId,
      date: dateToString(this.form.value.date),
      startTime: timeToString(startTime),
      endTime: timeToString(endTime),
    }

    this.events.saveShift(shift)
      .then(() => {
        // TODO: navigate to the day/week/whatever this event is on. Or back where you came from?
        this.router.navigate(["/week/2024/01/09"])
      })
  }
}


