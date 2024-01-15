import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Event } from '../services/model';
import { EventsService } from '../services/events.service';
import { Router } from '@angular/router';
import { dateToString, timeToString } from '../util/date.util';

@Component({
  selector: 'edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent {
  form: FormGroup

  constructor(private events: EventsService, private formBuilder: FormBuilder, private router: Router) {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      date: [new Date(), Validators.required],
      startTime: [new Date(1, 1, 1, 10, 0, 0), Validators.required],
      endTime: [new Date(1, 1, 1, 11, 0, 0), Validators.required],
    });
  }

  onSave() {
    const startTime = new Date(this.form.value.startTime);
    const endTime = new Date(this.form.value.endTime);

    const event: Event = {
      id: 0, // TODO: if it's an existing event, reuse the ID.
      title: this.form.value.title,
      description: this.form.value.description,
      date: dateToString(this.form.value.date),
      startTime: timeToString(startTime),
      endTime: timeToString(endTime),
    }

    this.events.saveEvent(event)
      .then(() => {
        // TODO: navigate to the day/week/whatever this event is on.
        this.router.navigate(["/week/2024/01/09"])
      })
  }
}


