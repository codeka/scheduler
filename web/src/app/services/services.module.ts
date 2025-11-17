import { APP_INITIALIZER, NgModule } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { InitService } from './init.service';
import { EventsService } from './events.service';
import { AdminService } from './admin.service';
import { ProfileService } from './profile.service';
import { ImageService } from './image.service';
import { DashboardService } from './dashboard.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    provideHttpClient(
      withInterceptors([AuthInterceptor]),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (init: InitService) => init.resolve(),
      multi: true,
      deps: [InitService],
    },
    AdminService,
    AuthService,
    DashboardService,
    EventsService,
    ImageService,
    InitService,
    ProfileService,
  ],
  bootstrap: [AuthService, InitService]
})
export class ServicesModule { }
