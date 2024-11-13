import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { EditCronJobDialogComponent } from "./edit-cron-job-dialog.component";

import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { NotificationType } from "../services/model";
import { EditNotificationTypeDialogComponent } from "./edit-notification-type-dialog.component";

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
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
