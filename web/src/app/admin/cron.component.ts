import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { EditCronJobDialogComponent } from "./edit-cron-job-dialog.component";

import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { CronJob } from "../services/model";
import { confirmAction } from "../widgets/confirm-dialog";
import { MatToolbar, MatToolbarModule } from "@angular/material/toolbar";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'cron',
  templateUrl: './cron.component.html',
  styleUrls: ['./cron.component.scss'],
  imports: [MatToolbarModule, MatIconModule, MatTableModule, MatButtonModule]
})
export class CronComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'schedule', 'enabled', 'nextRun', 'actions'];
  cronJobs: CronJob[] = []

  constructor(public init: InitService, private adminService: AdminService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
      this.adminService.getCronJobs()
          .then(cronJobs => {
            this.cronJobs = cronJobs
          })
  }

  onAddJob() {
    const dialogRef = this.dialog.open(EditCronJobDialogComponent, {})
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onEditJob(job: CronJob) {
    const dialogRef = this.dialog.open(EditCronJobDialogComponent, {
      data: { cronJob: job },
    })
    dialogRef.afterClosed().subscribe(() => {
      // Refresh the page.
      this.ngOnInit();
    })
  }

  onRunJob(job: CronJob) {
    confirmAction(this.dialog, {
      msg: "Run this job now?",
      title: "Run Job",
      confirmButtonLabel: "RUN JOB"
    }).then(() => {
      this.adminService.runJob(job.id)
      .then(_ => {
        this.ngOnInit();
      })
    })
  }
}
