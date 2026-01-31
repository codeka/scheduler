import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { TitleStrategy } from '@angular/router';
import { ShiftsTitleStrategy } from './app/title-strategy';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ServicesModule } from './app/services/services.module';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core'; // 1. Import it


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AppRoutingModule, BrowserModule, MatButtonModule, MatIconModule,
             MatMenuModule, MatToolbarModule, ServicesModule),
        provideNativeDateAdapter(),
        { provide: TitleStrategy, useClass: ShiftsTitleStrategy },
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
