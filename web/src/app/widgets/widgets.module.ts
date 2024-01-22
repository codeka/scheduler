import { NgModule } from "@angular/core";

import { TimeInputComponent } from "./time-input.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldControl, MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { PhoneNoComponent } from "./phone-no.component";

@NgModule({
  declarations: [],
  imports: [
    BrowserAnimationsModule, CommonModule, FormsModule, MatFormFieldModule, MatIconModule, MatInputModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: MatFormFieldControl, useExisting: TimeInputComponent }
  ],
  bootstrap: []
})
export class WidgetsModule { }
