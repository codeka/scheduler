import { Component } from "@angular/core";
import { MatListModule, MatNavList } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule, RouterOutlet } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { InitService } from "../services/init.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'adminser',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [MatListModule, MatIconModule, MatNavList, RouterOutlet, RouterModule,
    MatButtonModule, CommonModule]
})
export class AdminComponent {
  constructor(public init: InitService) {}
}
