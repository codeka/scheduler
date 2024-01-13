import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';

import { IgxTimePickerModule } from 'igniteui-angular';

import { EditEventComponent } from './edit-event.component';
import { WeekComponent } from './week.component';
import { ServicesModule } from '../services/services.module';

@NgModule({
  declarations: [EditEventComponent, WeekComponent],
  imports: [
    CommonModule, FormsModule, IgxTimePickerModule, MatButtonModule, MatCardModule, MatDatepickerModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule, MatToolbarModule, ServicesModule
  ],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
