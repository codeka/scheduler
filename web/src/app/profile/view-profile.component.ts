import { Component, Input } from "@angular/core"
import { format, parse } from "libphonenumber-js";

import { User } from "../services/model"
import { ImageService } from "../services/image.service";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss'],
  imports: [CommonModule, MatButtonModule, MatInputModule]
})
export class ViewProfileComponent {

  @Input()
  user!: User

  constructor(public img: ImageService) {}

  displayPhoneNumber(): string {
    const displayNumber = format(parse(this.user.phone), "NATIONAL")
    if (displayNumber == "") {
        return this.user.phone
    }
    return displayNumber
  }
}
