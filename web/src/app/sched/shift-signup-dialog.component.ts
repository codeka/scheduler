import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { Group, Shift } from "../services/model";
import { formatStartEndTime, stringToDate, stringToTime } from "../util/date.util";

// TODO: include proper stuff here.
export interface DialogData {
  group: Group
  shift: Shift
  user?: string
}

@Component({
  selector: 'shift-signup-dialog',
  templateUrl: './shift-signup-dialog.component.html',
  styleUrls: ['./shift-signup-dialog.component.scss']
})
export class ShiftSignupDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShiftSignupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}


  shiftTimeStr(shift: Shift): string {
    const startTime = stringToTime(shift.startTime)
    const endTime = stringToTime(shift.endTime)
    return formatStartEndTime(startTime, endTime)
  }

  shiftDateStr(shift: Shift): string {
    const date = stringToDate(shift.date)
    return date.toLocaleString('default', { month: 'short' }) + " " + date.toLocaleString('default', { day: '2-digit' })
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
