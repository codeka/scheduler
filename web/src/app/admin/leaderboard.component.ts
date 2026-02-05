import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { Group, LeaderboardEntry } from "../services/model";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
  imports: [MatToolbarModule, MatIconModule, MatTableModule, MatButtonModule, CommonModule, MatSelectModule]
})
export class LeaderboardComponent implements OnInit {
  selectedPeriod: string = 'allTime';
  numMonths: number = 0;

  constructor(public init: InitService, private adminService: AdminService, private dialog: MatDialog) {
  }

  groups: Array<Group> = this.init.groups()
  leaders: Map<number, LeaderboardEntry[]> = new Map()
  userMap: Map<number, string> = new Map()

  onPeriodChange(newPeriod: string) {
    if (!newPeriod) {
      newPeriod = 'allTime'
    }

    if (newPeriod === 'allTime') {
      this.numMonths = 0
    } else if (newPeriod === 'lastYear') {
      this.numMonths = 12
    } else if (newPeriod === 'lastMonth') {
      this.numMonths = 1
    }
    this.selectedPeriod = newPeriod
    this.refresh()
  }


  ngOnInit(): void {
    this.adminService.getUsers().then((users) => {
      for (const user of users) {
        this.userMap.set(user.id, user.name)
      }
    })

    this.refresh()
  }

  refresh() {
    this.leaders.clear()
    this.adminService.getLeaderboard(this.numMonths).then((leaderboard) => {
      for (const entry of leaderboard) {
        if (!this.leaders.has(entry.groupId)) {
          this.leaders.set(entry.groupId, [])
        }
        this.leaders.get(entry.groupId)?.push(entry)
      }

      for (const [groupId, entries] of this.leaders) {
        entries.sort((a, b) => b.numShifts - a.numShifts)
      }
    })
  }
}
