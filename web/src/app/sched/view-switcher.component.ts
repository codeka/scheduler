import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//import { DayComponent } from './day.component';
//import { WeekComponent } from './week.component';
//import { MonthComponent } from './month.component';
import { MatFormField, MatSelect, MatOption } from "@angular/material/select";

@Component({
  selector: 'view-switcher',
  templateUrl: './view-switcher.component.html',
  styleUrls: ['./view-switcher.component.scss'],
  imports: [MatFormField, MatSelect, MatOption]
})
export class ViewSwitcherComponent {
  currView = 'schedule';
  @Input() date = new Date();

  constructor(route: ActivatedRoute, private router: Router) {
    if (route.component?.name == 'DayComponent') {
      this.currView = 'daily'
    } else if (route.component?.name == 'WeekComponent') {
      this.currView = 'weekly'
    } else if (route.component?.name == 'MonthComponent') {
      this.currView = 'monthly'
    } else {
      this.currView = 'schedule'
    }
  }

  onViewChanged(value: string) {
    if (value == 'daily') {
      this.router.navigate(['day', this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDate()]);
    } else if (value == 'weekly') {
      this.router.navigate(['week', this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDate()]);
    } else if (value == 'monthly') {
      this.router.navigate(['month', this.date.getFullYear(), this.date.getMonth() + 1]);
    } else if (value == 'schedule') {
      this.router.navigate(['/'])
    }
  }
}

