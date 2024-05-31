import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ServicesModule } from '../services/services.module';

import { DayComponent } from './day.component';
import { EditEventDialogComponent } from './edit-event-dialog.component';
import { EditShiftDialogComponent } from './edit-shift-dialog.component';
import { MonthComponent } from './month.component';
import { ScheduleComponent } from './schedule.component';
import { ShiftSignupDialogComponent } from './shift-signup-dialog.component';
import { ViewSwitcherComponent } from './view-switcher.component';
import { WeekComponent } from './week.component';
import { WidgetsModule } from '../widgets/widgets.module';

@NgModule({
  declarations: [
    DayComponent, EditEventDialogComponent, EditShiftDialogComponent, MonthComponent, ScheduleComponent,
    ShiftSignupDialogComponent, ViewSwitcherComponent, WeekComponent],
  imports: [
    BrowserAnimationsModule, CommonModule, FormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatChipsModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, 
    MatNativeDateModule, MatSelectModule, MatToolbarModule, MatTooltipModule, ReactiveFormsModule, ServicesModule,
    WidgetsModule,
  ],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
