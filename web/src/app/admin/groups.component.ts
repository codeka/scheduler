import { Component } from "@angular/core";
import { InitService } from "../services/init.service";
import { Group } from "../services/model";

@Component({
  selector: 'groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent {
  displayedColumns: string[] = ['name', 'required_signups', 'actions'];
  groups: Group[] = []

  constructor(public init: InitService) {
    this.groups = init.groups()
  }

}
