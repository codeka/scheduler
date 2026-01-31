import { Component } from "@angular/core";
import { InitService } from "../services/init.service";
import { Group } from "../services/model";
import { EditGroupDialogComponent } from "./edit-group-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  imports: [MatToolbarModule, MatIcon, MatTableModule, MatButtonModule]
})
export class GroupsComponent {
  displayedColumns: string[] = [
    'name', 'required_signups', 'always_show', 'shift_start_offset', 'shift_end_offset', 'actions'
  ];
  groups: Group[] = []

  constructor(public init: InitService, private dialog: MatDialog) {
    this.groups = init.groups()
  }

  editGroup(group: Group) {
    const dialogRef = this.dialog.open(EditGroupDialogComponent, {
      data: { group: group },
    })
    dialogRef.afterClosed().subscribe(() => {
      // We want to actually reload the page so that the init call happens again.
      window.location.reload();
    })
  }
}
