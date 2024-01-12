import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WeekComponent } from './week.component';
import { ServicesModule } from '../services/services.module';

@NgModule({
  declarations: [WeekComponent],
  imports: [CommonModule, ServicesModule],
  providers: [],
  bootstrap: []
})
export class SchedModule { }
