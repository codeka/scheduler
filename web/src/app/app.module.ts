import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { SchedModule } from './sched/sched.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    ServicesModule,
    SchedModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
