import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { WeekComponent } from './sched/week.component';

import { ConfirmComponent } from './auth/confirm.component';
import { LoginComponent } from './auth/login.component';

import { AuthService } from './services/auth.service';
import { EditEventComponent } from './sched/edit-event.component';
import { DayComponent } from './sched/day.component';
import { MonthComponent } from './sched/month.component';
import { EditShiftComponent } from './sched/edit-shift.component';
import { ScheduleComponent } from './sched/schedule.component';
import { UserListComponent } from './admin/user-list.component';

const loggedInActivate: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn();
};

const isEventManagerActivate: CanActivateFn = () => {
  return inject(AuthService).isInRole('EVENT_MANAGER');
};

const isAdminActivate: CanActivateFn = () => {
  return inject(AuthService).isInRole('ADMIN');
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
  { path: 'edit-shift', canActivate: [isEventManagerActivate], component: EditShiftComponent },

  // Paths for admins.
  { path: 'users', canActivate: [isAdminActivate], component: UserListComponent },

  // By default, we show the 'schedule' view, which shows all the events this month and everything in the future that
  // we have in the database.
  { path: '', canActivate: [loggedInActivate], component: ScheduleComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
