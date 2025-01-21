import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Group, Shift } from '../services/model';
import { EventsService } from '../services/events.service';
import { dateToString, stringToDate, stringToTime, timeToString } from '../util/date.util';
import { InitService } from '../services/init.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { confirmAction } from '../widgets/confirm-dialog';

export interface DialogData {
  group: Group
}

@Component({
  selector: 'mailing-list-dialog',
  templateUrl: './mailing-list-dialog.component.html',
  styleUrls: ['./mailing-list-dialog.component.scss']
})
export class MailingListDialogComponent implements OnInit {
  shiftManagers = ""
  members = ""

  constructor(
      private events: EventsService, public init: InitService, private dialog: MatDialog,
      public dialogRef: MatDialogRef<MailingListDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  public ngOnInit(): void {
    this.events.getGroupUsers(this.data.group.id).then((users) => {
      var shiftManagers = ""
      var members = ""
      for (const user of users) {
        const entry = "\"" + user.name + "\" <" + user.email + ">"
        if (user.roles.indexOf("SHIFT_MANAGER") >= 0) {
          if (shiftManagers != "") {
            shiftManagers += ", "
          }
          shiftManagers += entry
        } else {
          if (members != "") {
            members += ", "
          }
          members += entry
        }
      }
      this.shiftManagers = shiftManagers
      this.members = members
    })
  }
}


