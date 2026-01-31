import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { NotificationType } from "../services/model";
import { EditNotificationTypeDialogComponent } from "./edit-notification-type-dialog.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [MatToolbarModule, MatIconModule, MatTableModule, MatButtonModule]
})
export class NotificationsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'emailTemplateId', 'smsTemplate', 'actions'];
  notifications: NotificationType[] = []

  constructor(public init: InitService, private adminService: AdminService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.adminService.getNotificationTypes()
      .then((notificationTypes) => {
        this.notifications = notificationTypes
      })
  }

  onEditNotificationType(notificationType: NotificationType) {
    const dialogRef = this.dialog.open(EditNotificationTypeDialogComponent, {
      data: { notificationType: notificationType },
    })
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }
}
