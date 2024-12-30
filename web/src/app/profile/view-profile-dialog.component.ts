import { Component, Inject, OnInit } from "@angular/core"
import { User } from "../services/model"
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ImageService } from "../services/image.service";
import { AsYouType, format, parse } from "libphonenumber-js";


export interface DialogData {
  user: User
}

@Component({
  selector: 'view-profile-dialog',
  templateUrl: './view-profile-dialog.component.html',
  styleUrls: ['./view-profile-dialog.component.scss']
})
export class ViewProfileDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ViewProfileDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog, public img: ImageService) {}

  ngOnInit(): void {
    // TODO
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  displayPhoneNumber(): string {
    const displayNumber = format(parse(this.data.user.phone), "NATIONAL")
    if (displayNumber == "") {
        return this.data.user.phone
    }
    return displayNumber
  }
}
