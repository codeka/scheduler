import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { InitService } from './init.service';

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
    AuthService,
    InitService,
  ],
  bootstrap: [AuthService, InitService]
})
export class ServicesModule { }
