import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";

import { AppRoutingModule } from "../app-routing.module";
import { ServicesModule } from "../services/services.module";
import { WidgetsModule } from "../widgets/widgets.module";

import { EditUserComponent } from "./edit-user.component";
import { UserListComponent } from "./user-list.component";
import { EditVenueComponent } from "./edit-venue.component";

@NgModule({
  declarations: [EditUserComponent, EditVenueComponent, UserListComponent],
  imports: [
    AppRoutingModule, BrowserModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSlideToggleModule, MatToolbarModule, MatTableModule, ReactiveFormsModule, ServicesModule,
    WidgetsModule],
  providers: [],
  bootstrap: []
})
export class AdminModule { }
