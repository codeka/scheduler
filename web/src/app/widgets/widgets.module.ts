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
import { ConfirmationDialogComponent } from "./confirm-dialog.component";
import { MatCardModule } from "@angular/material/card";
import { SafeHtmlPipe } from "../util/safe-html-pipe";

@NgModule({
  declarations: [ConfirmationDialogComponent, ImagePickerComponent, PhoneNoComponent, TimeInputComponent],
  exports: [ConfirmationDialogComponent, ImagePickerComponent, PhoneNoComponent, TimeInputComponent],
  imports: [
    BrowserAnimationsModule, CommonModule, FormsModule, MatButton, MatCardModule, MatFormFieldModule, MatIconModule,
    MatInputModule, ReactiveFormsModule, SafeHtmlPipe,
  ],
  providers: [],
  bootstrap: []
})
export class WidgetsModule { }
