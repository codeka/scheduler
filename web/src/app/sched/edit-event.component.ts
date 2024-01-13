import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Event } from '../services/model';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss']
})
export class EditEventComponent {
  constructor() {}

  onSave(f: NgForm) {

  }
}


