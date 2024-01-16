import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

import { IgxTimePickerModule } from 'igniteui-angular';

import { ServicesModule } from '../services/services.module';

import { DayComponent } from './day.component';
import { EditEventComponent } from './edit-event.component';
import { MonthComponent } from './month.component';
import { ViewSwitcherComponent } from './view-switcher.component';
import { WeekComponent } from './week.component';
import { EditShiftComponent } from './edit-shift.component';

@NgModule({
  declarations: [
    DayComponent, EditEventComponent, EditShiftComponent, MonthComponent, ViewSwitcherComponent, WeekComponent],
  imports: [
    CommonModule, FormsModule, IgxTimePickerModule, MatButtonModule, MatCardModule, MatDatepickerModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule, MatSelectModule, MatToolbarModule,
    ReactiveFormsModule, ServicesModule
  ],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
