import { Component, Inject, OnInit } from '@angular/core';
import { InitService } from './services/init.service';
import { User, Venue } from './services/model';
import { AuthService } from './services/auth.service';
import { DOCUMENT } from '@angular/common';
import { ENV } from './env/environment';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  venue: Venue
  user?: User
  pageTitle: string = 'Shifts'
  toolbarVisible = true

  constructor(init: InitService, public auth: AuthService,
              @Inject(DOCUMENT) private doc: Document,
              private router: Router) {
    this.venue = init.venue()
    this.user = init.user()

    const link = this.doc.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', ENV.backend + "/_/favicon.ico");
    this.doc.head.appendChild(link);
  }

  ngOnInit() {
    // Listen to route changes and update pageTitle accordingly
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
      this.updateToolbarVisibility();
    });
  }

  private updatePageTitle() {
    // Map routes to their display titles
    const routeTitleMap: { [key: string]: string } = {
      '/dashboard': 'Events',
    };

    const currentRoute = this.router.url.split('?')[0]; // Remove query params
    this.pageTitle = routeTitleMap[currentRoute] || 'Shifts';
  }

  private updateToolbarVisibility() {
    const currentRoute = this.router.url.split('?')[0]; // Remove query params
    this.toolbarVisible = (currentRoute != "/dashboard");
  }

  isMobile() {
    return document.body.offsetWidth < 1024
  }

  logout() {
    this.auth.logout()
  }
}
