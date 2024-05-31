import { NgModule, inject } from '@angular/core';
import { CanMatchFn, RouterModule, Routes } from '@angular/router';
import { WeekComponent } from './sched/week.component';

import { ConfirmComponent } from './auth/confirm.component';
import { LoginComponent } from './auth/login.component';

import { AuthService } from './services/auth.service';
import { DayComponent } from './sched/day.component';
import { MonthComponent } from './sched/month.component';
import { ScheduleComponent } from './sched/schedule.component';
import { UserListComponent } from './admin/user-list.component';
import { EditUserComponent } from './admin/edit-user.component';
import { EditVenueComponent } from './admin/edit-venue.component';
import { NotFoundComponent } from './not-found.component';

const loggedIn: CanMatchFn = () => {
  return inject(AuthService).isLoggedIn();
};

function inRole(roleName: string): CanMatchFn {
  return () => {
    return inject(AuthService).isInRole(roleName);
  }
}

const routes: Routes = [
  // Login can match any time.
  { path: 'login', component: LoginComponent },
  { path: 'login/confirm', component: ConfirmComponent },

  // Most paths will only match if you're logged in.
  { path: 'day', canMatch: [loggedIn], component: DayComponent },
  { path: 'day/:year/:month/:day', canMatch: [loggedIn], component: DayComponent },
  { path: 'week', canMatch: [loggedIn], component: WeekComponent },
  { path: 'week/:year/:month/:day', canMatch: [loggedIn], component: WeekComponent },
  { path: 'month', canMatch: [loggedIn], component: MonthComponent },
  { path: 'month/:year/:month', canMatch: [loggedIn], component: MonthComponent },

  // Paths for admins.
  { path: 'users', canMatch: [inRole('ADMIN')], component: UserListComponent },
  { path: 'edit-user/:id', canMatch: [inRole('ADMIN')], component: EditUserComponent },
  { path: 'edit-user', canMatch: [inRole('ADMIN')], component: EditUserComponent },
  { path: 'edit-venue', canMatch: [inRole('ADMIN')], component: EditVenueComponent },

  // By default, we show the 'schedule' view, which shows all the events this month and everything in the future that
  // we have in the database.
  { path: '', canMatch: [loggedIn], component: ScheduleComponent, pathMatch: "full" },

  { path: '**', canMatch: [loggedIn], component: NotFoundComponent },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
