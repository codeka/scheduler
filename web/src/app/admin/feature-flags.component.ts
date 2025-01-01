import { Component } from "@angular/core";
import { InitService } from "../services/init.service";
import { FeatureFlag, Group } from "../services/model";
import { MatDialog } from "@angular/material/dialog";
import { EditFeatureFlagDialogComponent } from "./edit-feature-flag-dialog.component";

@Component({
  selector: 'feature-flags',
  templateUrl: './feature-flags.component.html',
  styleUrls: ['./feature-flags.component.scss']
})
export class FeatureFlagsComponent {
  displayedColumns: string[] = [
    'name', 'enabled', 'settings', 'actions'
  ];
  featureFlags: FeatureFlag[] = []

  constructor(public init: InitService, private dialog: MatDialog) {
    this.featureFlags = init.allFeatureFlags()
  }

  settingsString(flag: FeatureFlag): string {
    return flag.settings == null ? "" : JSON.stringify(flag.settings)
  }

  editFlag(flag: FeatureFlag) {
    const dialogRef = this.dialog.open(EditFeatureFlagDialogComponent, {
      data: { flag: flag },
    })
    dialogRef.afterClosed().subscribe(() => {
      // We want to actually reload the page so that the init call happens again.
      window.location.reload();
    })
  }
}
