import { APP_INITIALIZER, NgModule } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { InitService } from './init.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    provideHttpClient(),
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
