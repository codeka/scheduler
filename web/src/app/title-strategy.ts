import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable({providedIn: 'root'})
export class ShiftsTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    // TODO: include the day/week/month in the title?
    if (title !== undefined) {
      this.title.setTitle(`Shifts - ${title}`);
    }
  }
}
