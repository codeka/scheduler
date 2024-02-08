import { NgModule } from "@angular/core";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

import { ImagePickerComponent } from "./image-picker.component";
import { MatButton } from "@angular/material/button";
import { TimeInputComponent } from "./time-input.component";
import { PhoneNoComponent } from "./phone-no.component";

@NgModule({
  declarations: [ImagePickerComponent, PhoneNoComponent, TimeInputComponent],
  exports: [ImagePickerComponent, PhoneNoComponent, TimeInputComponent],
  imports: [
    BrowserAnimationsModule, CommonModule, FormsModule, MatButton, MatFormFieldModule, MatIconModule, MatInputModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: []
})
export class WidgetsModule { }
