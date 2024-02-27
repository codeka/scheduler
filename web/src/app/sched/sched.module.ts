import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ServicesModule } from '../services/services.module';

import { DayComponent } from './day.component';
import { EditEventComponent } from './edit-event.component';
import { MonthComponent } from './month.component';
import { ViewSwitcherComponent } from './view-switcher.component';
import { WeekComponent } from './week.component';
import { EditShiftComponent } from './edit-shift.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { ScheduleComponent } from './schedule.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShiftSignupDialogComponent } from './shift-signup-dialog.component';

@NgModule({
  declarations: [
    DayComponent, EditEventComponent, EditShiftComponent, MonthComponent, ScheduleComponent, ShiftSignupDialogComponent,
    ViewSwitcherComponent, WeekComponent],
  imports: [
    BrowserAnimationsModule, CommonModule, FormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
    MatSelectModule, MatToolbarModule, MatTooltipModule, ReactiveFormsModule, ServicesModule, WidgetsModule,
  ],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
