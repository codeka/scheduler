import { NgModule, inject } from '@angular/core';
import { CanMatchFn, RouterModule, Routes } from '@angular/router';
import { WeekComponent } from './sched/week.component';

import { ConfirmComponent } from './auth/confirm.component';
import { LoginComponent } from './auth/login.component';

import { AuthService } from './services/auth.service';
import { CronComponent } from './admin/cron.component';
import { DayComponent } from './sched/day.component';
import { MonthComponent } from './sched/month.component';
import { UserListComponent } from './admin/user-list.component';
import { EditVenueComponent } from './admin/edit-venue.component';
import { NotFoundComponent } from './not-found.component';
import { AdminComponent } from './admin/admin.component';
import { GroupsComponent } from './admin/groups.component';
import { ProfileComponent } from './profile/profile.component';
import { ScheduleDesktopComponent } from './sched/schedule-desktop.component';
import { ScheduleMobileComponent } from './sched/schedule-mobile.component';

const loggedIn: CanMatchFn = () => {
  return inject(AuthService).isLoggedIn();
};

function inRole(roleName: string): CanMatchFn {
  return () => {
    return inject(AuthService).isInRole(roleName);
  }
}

const isMobile: CanMatchFn = () => {
  return document.body.offsetWidth < 1024
}
const isNotMobile: CanMatchFn = () => {
  return document.body.offsetWidth >= 1024
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
  { 
    path: 'admin', canMatch: [inRole('ADMIN')], component: AdminComponent,
    children: [
      { path: 'edit-venue', component: EditVenueComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'users', component: UserListComponent },
      { path: 'cron', component: CronComponent },
    ]
  },

  {
    path: 'profile', canMatch: [loggedIn], component: ProfileComponent,
  },
  
  // By default, we show the 'schedule' view, which shows all the events this month and everything in the future that
  // we have in the database.
  { path: '', canMatch: [loggedIn, isMobile], component: ScheduleMobileComponent, pathMatch: "full" },
  { path: '', canMatch: [loggedIn, isNotMobile], component: ScheduleDesktopComponent, pathMatch: "full" },

  { path: '**', canMatch: [loggedIn], component: NotFoundComponent },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
