import { ConfirmDialogData, ConfirmationDialogComponent } from "./confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

/** Helper for showing a confirmation dialog in material style (rather than native browser style). */
export function confirmAction(dialog: MatDialog, data: ConfirmDialogData): Promise<boolean> {
  return new Promise<boolean>((result, reject) => {
    const dialogRef = dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
      data: data,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        result(true)
      } else {
        reject()
      }
    });
  });
}
