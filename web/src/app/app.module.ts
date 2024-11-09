import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppRoutingModule } from './app-routing.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ServicesModule } from './services/services.module';
import { SchedModule } from './sched/sched.module';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found.component';

@NgModule({
  declarations: [
    AppComponent, NotFoundComponent
  ],
  imports: [
    AdminModule, AppRoutingModule, AuthModule, BrowserModule, BrowserAnimationsModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatToolbarModule, ProfileModule, ServicesModule, SchedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
