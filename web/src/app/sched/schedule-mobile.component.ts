import { Component } from "@angular/core";
import { ScheduleComponent } from "./schedule.component";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'schedule-mobile',
  templateUrl: 'schedule-mobile.component.html',
  styleUrls: ['schedule-mobile.component.scss'],
  imports: [
    MatChipsModule, MatIconModule, MatCheckboxModule, MatToolbarModule, CommonModule,
    MatTooltipModule, MatButtonModule]
})
export class ScheduleMobileComponent extends ScheduleComponent {
}
