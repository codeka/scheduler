import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../services/admin.service";
import { InitService } from "../services/init.service";
import { Router } from "@angular/router";
import { Venue } from "../services/model";
import { FileInfo } from "../widgets/image-picker.component";
import { ImageService } from "../services/image.service";

@Component({
  selector: 'edit-venue',
  templateUrl: './edit-venue.component.html',
  styleUrls: ['./edit-venue.component.scss']
})
export class EditVenueComponent {
  form: FormGroup<{
    name: FormControl<string|null>,
    shortName: FormControl<string|null>,
    address: FormControl<string|null>,
  }>

  fileInfo: FileInfo|null = null

  constructor(
      private admin: AdminService, private formBuilder: FormBuilder, public init: InitService,
      private router: Router, public img: ImageService) {
    this.form = this.formBuilder.group({
      name: [init.venue().name, Validators.required],
      shortName: [init.venue().shortName, Validators.required],
      address: [init.venue().address],
    });
  }

  onSave() {
    const venue: Venue = {
      name: this.form.value.name ?? "",
      shortName: this.form.value.shortName ?? "",
      address: this.form.value.address ?? "",
      pictureName: this.init.venue().pictureName,
      picture: this.fileInfo?.file ?? undefined
    }

    this.admin.saveVenue(venue)
      .then(() => {

        if (this.fileInfo != null) {
          // We have to upload the image first.
          this.admin.saveVenuePicture(this.fileInfo.filename, this.fileInfo.file)
            .then(() => {
              this.saveComplete();
            });
        } else {
          this.saveComplete();
        }
      })
  }

  saveComplete() {
    // Instead of navigating, we want to actually reload the page so that the init call happens again.
    window.location.reload();
  }

  imageUpdated(file: FileInfo) {
    this.fileInfo = file
  }
}
