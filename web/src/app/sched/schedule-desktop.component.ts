import { Component } from "@angular/core";
import { ScheduleComponent } from "./schedule.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ViewSwitcherComponent } from "./view-switcher.component";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'schedule-desktop',
  templateUrl: 'schedule-desktop.component.html',
  styleUrls: ['schedule-desktop.component.scss'],
  imports: [
    MatCheckboxModule, ViewSwitcherComponent, MatIconModule, MatMenuModule, CommonModule,
    MatChipsModule, MatTooltipModule, MatButtonModule, MatToolbarModule
  ]
})
export class ScheduleDesktopComponent extends ScheduleComponent {
}
