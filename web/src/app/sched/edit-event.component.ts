import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Event } from '../services/model';
import { EventsService } from '../services/events.service';
import { Router } from '@angular/router';
import { dateToString, timeToString } from '../util/date.util';
import { MyTel } from '../widgets/phone-no.component';

@Component({
  selector: 'edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent {
  form: FormGroup<{
    title: FormControl<string|null>,
    description: FormControl<string|null>,
    date: FormControl<Date|null>,
    startTime: FormControl<Date|null>,
    endTime: FormControl<Date|null>
  }>

  constructor(private events: EventsService, private formBuilder: FormBuilder, private router: Router) {
    this.form = this.formBuilder.group({
      title: ["", Validators.required],
      description: [""],
      date: [new Date(), Validators.required],
      startTime: [new Date(1, 1, 1, 10, 0, 0), Validators.required],
      endTime: [new Date(1, 1, 1, 11, 0, 0), Validators.required],
    });
  }

  onSave() {
    if (!this.form.value.date || !this.form.value.startTime || !this.form.value.endTime) {
      console.log("some values are not set: date=" + this.form.value.date + ", startTime=" + this.form.value.startTime)
      return
    }

    const event: Event = {
      id: 0, // TODO: if it's an existing event, reuse the ID.
      title: this.form.value.title ?? "",
      description: this.form.value.description ?? "",
      date: dateToString(this.form.value.date),
      startTime: timeToString(this.form.value.startTime),
      endTime: timeToString(this.form.value.endTime),
    }

    this.events.saveEvent(event)
      .then(() => {
        // TODO: navigate to the day/week/whatever this event is on.
        this.router.navigate(["/week"])
      })
  }
}
