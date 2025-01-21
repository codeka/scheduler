import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ServicesModule } from '../services/services.module';

import { DayComponent } from './day.component';
import { EditEventDialogComponent } from './edit-event-dialog.component';
import { EditShiftDialogComponent } from './edit-shift-dialog.component';
import { MonthComponent } from './month.component';
import { ScheduleDesktopComponent } from './schedule-desktop.component';
import { ShiftSignupDialogComponent } from './shift-signup-dialog.component';
import { ViewSwitcherComponent } from './view-switcher.component';
import { WeekComponent } from './week.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { ScheduleMobileComponent } from './schedule-mobile.component';
import { ProfileModule } from '../profile/profile.module';
import { MailingListDialogComponent } from './mailing-list-dialog.component';

@NgModule({
  declarations: [
    DayComponent, EditEventDialogComponent, EditShiftDialogComponent, MailingListDialogComponent, MonthComponent,
    ScheduleDesktopComponent, ScheduleMobileComponent, ShiftSignupDialogComponent, ViewSwitcherComponent,
    WeekComponent],
  imports: [
    BrowserAnimationsModule, CommonModule, FormsModule, MatAutocompleteModule, MatButtonModule, MatCardModule,
    MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatMenuModule, MatNativeDateModule, MatSelectModule, MatToolbarModule, MatTooltipModule,
    ReactiveFormsModule, ServicesModule, WidgetsModule, ProfileModule,
  ],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
