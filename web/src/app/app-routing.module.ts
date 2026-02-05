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
import { NotificationsComponent } from './admin/notifications.component';
import { FeatureFlagsComponent } from './admin/feature-flags.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaderboardComponent } from './admin/leaderboard.component';

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
  { path: 'login', title: 'Login"', component: LoginComponent },
  { path: 'login/confirm', title: 'Login - Confirm', component: ConfirmComponent },

  // Most paths will only match if you're logged in.
  { path: 'day', title: 'Daily', canMatch: [loggedIn], component: DayComponent },
  { path: 'day/:year/:month/:day', title: 'Shifts - Daily', canMatch: [loggedIn], component: DayComponent },
  { path: 'week', title: 'Weekly', canMatch: [loggedIn], component: WeekComponent },
  { path: 'week/:year/:month/:day', title: 'Weekly', canMatch: [loggedIn], component: WeekComponent },
  { path: 'month', title: 'Monthly', canMatch: [loggedIn], component: MonthComponent },
  { path: 'month/:year/:month', title: 'Monthly', canMatch: [loggedIn], component: MonthComponent },

  // Note: dashboard doesn't need to be logged in.
  { path: 'dashboard', title: 'Dashboard', component: DashboardComponent },

  // Paths for admins.
  { 
    path: 'admin', title: 'Shifts - Admin', canMatch: [inRole('ADMIN')], component: AdminComponent,
    children: [
      { path: 'edit-venue', title: 'Admin - Edit Venue', component: EditVenueComponent },
      { path: 'groups', title: 'Admin - Groups', component: GroupsComponent },
      { path: 'users', title: 'Admin - Users', component: UserListComponent },
      { path: 'leaderboard', title: 'Admin - Leaderboard', component: LeaderboardComponent },
      { path: 'cron', title: 'Admin - Cron', component: CronComponent },
      { path: 'notifications', title: 'Notifications', component: NotificationsComponent },
      { path: 'flags', title: 'Flags', component: FeatureFlagsComponent },
    ]
  },

  {
    path: 'profile', title: 'Profile', canMatch: [loggedIn], component: ProfileComponent,
  },
  
  // By default, we show the 'schedule' view, which shows all the events this month and everything in the future that
  // we have in the database.
  { path: '', title: 'Schedule', canMatch: [loggedIn, isMobile], component: ScheduleMobileComponent, pathMatch: "full" },
  { path: '', title: 'Schedule', canMatch: [loggedIn, isNotMobile], component: ScheduleDesktopComponent, pathMatch: "full" },

  { path: '**', canMatch: [loggedIn], component: NotFoundComponent },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
