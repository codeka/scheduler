import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { WeekComponent } from './sched/week.component';

import { ConfirmComponent } from './auth/confirm.component';
import { LoginComponent } from './auth/login.component';

import { AuthService } from './services/auth.service';
import { EditEventComponent } from './sched/edit-event.component';
import { DayComponent } from './sched/day.component';
import { MonthComponent } from './sched/month.component';

const loggedInActivate: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn();
};

const isEventManagerActivate: CanActivateFn = () => {
  return inject(AuthService).isInRole('EVENT_MANAGER');
};

const defaultRouteActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isLoggedIn()) {
    return router.parseUrl("/week");
  } else {
    return router.parseUrl("/login");
  }
};

const routes: Routes = [
  // Login can match any time.
  { path: 'login', component: LoginComponent },
  { path: 'login/confirm', component: ConfirmComponent },

  // Most paths will only match if you're logged in.
  { path: 'day', canActivate: [loggedInActivate], component: DayComponent },
  { path: 'day/:year/:month/:day', canActivate: [loggedInActivate], component: DayComponent },
  { path: 'week', canActivate: [loggedInActivate], component: WeekComponent },
  { path: 'week/:year/:month/:day', canActivate: [loggedInActivate], component: WeekComponent },
  { path: 'month', canActivate: [loggedInActivate], component: MonthComponent },
  { path: 'month/:year/:month', canActivate: [loggedInActivate], component: MonthComponent },

  // Paths for event managers.
  { path: 'edit-event', canActivate: [isEventManagerActivate], component: EditEventComponent },

  // The default matcher, redirects to /week if logged in, or /login otherwise. We just put WeekComponent here, but
  // defaultRouteActive always redirects, so it's just a dummy.
  { path: '', canActivate: [defaultRouteActivate], component: WeekComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
