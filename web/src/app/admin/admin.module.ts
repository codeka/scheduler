import { NgModule } from "@angular/core";
import { UserListComponent } from "./user-list.component";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTableModule } from "@angular/material/table";
import { ServicesModule } from "../services/services.module";
import { MatToolbarModule } from "@angular/material/toolbar";

@NgModule({
  declarations: [UserListComponent],
  imports: [
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatToolbarModule,
    MatSlideToggleModule, MatTableModule, ServicesModule],
  providers: [],
  bootstrap: []
})
export class AdminModule { }
