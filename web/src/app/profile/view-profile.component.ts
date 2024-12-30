import { Component, Input } from "@angular/core"
import { format, parse } from "libphonenumber-js";

import { User } from "../services/model"
import { ImageService } from "../services/image.service";

@Component({
  selector: 'view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
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
