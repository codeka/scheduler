import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmDialogData {
  msg?: string
  title?: string
  confirmButtonLabel?: string
}

@Component({
  selector: 'confirm-dialog',
  styleUrls: ['confirm-dialog.component.scss'],
  templateUrl: 'confirm-dialog.component.html',
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
