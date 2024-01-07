import { NgModule } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [AuthService],
  providers: [],
  bootstrap: []
})
export class ServicesModule { }
