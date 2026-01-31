import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatCard, MatCardHeader, MatCardTitle, MatCardActions, MatCardModule } from "@angular/material/card";
import { SafeHtmlPipe } from "../util/safe-html-pipe";
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  msg?: string
  title?: string
  confirmButtonLabel?: string
}

@Component({
  selector: 'confirm-dialog',
  styleUrls: ['confirm-dialog.component.scss'],
  templateUrl: 'confirm-dialog.component.html',
  imports: [MatCardModule, MatDialogModule, MatButtonModule, SafeHtmlPipe],
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
