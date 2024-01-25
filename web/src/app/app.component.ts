import { Component } from '@angular/core';
import { InitService } from './services/init.service';
import { User, Venue } from './services/model';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  venue: Venue
  user?: User

  constructor(init: InitService, public auth: AuthService) {
    this.venue = init.venue()
    this.user = init.user()
  }
}
