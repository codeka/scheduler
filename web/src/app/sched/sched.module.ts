import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { WeekComponent } from './week.component';
import { ServicesModule } from '../services/services.module';

@NgModule({
  declarations: [WeekComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, ServicesModule],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
