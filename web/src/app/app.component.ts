import { Component, Inject } from '@angular/core';
import { InitService } from './services/init.service';
import { User, Venue } from './services/model';
import { AuthService } from './services/auth.service';
import { DOCUMENT } from '@angular/common';
import { ENV } from './env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  venue: Venue
  user?: User

  constructor(init: InitService, public auth: AuthService,
              @Inject(DOCUMENT) private doc: Document) {
    this.venue = init.venue()
    this.user = init.user()

    const link = this.doc.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', ENV.backend + "/_/favicon.ico");
    this.doc.head.appendChild(link);
  }

  isMobile() {
    return document.body.offsetWidth < 1024
  }

  logout() {
    this.auth.logout()
  }
}
