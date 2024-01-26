import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTableModule } from "@angular/material/table";
import { ServicesModule } from "../services/services.module";
import { MatToolbarModule } from "@angular/material/toolbar";

import { EditUserComponent } from "./edit-user.component";
import { UserListComponent } from "./user-list.component";

@NgModule({
  declarations: [EditUserComponent, UserListComponent],
  imports: [
    FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatToolbarModule,
    MatSlideToggleModule, MatTableModule, ReactiveFormsModule, ServicesModule],
  providers: [],
  bootstrap: []
})
export class AdminModule { }
