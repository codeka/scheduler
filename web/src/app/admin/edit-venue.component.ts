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
    shiftsWebAddress: FormControl<string|null>,
    webAddress: FormControl<string|null>,
    verificationEmailTemplateId: FormControl<string|null>,
  }>

  fileInfo: FileInfo|null = null
  icoFileInfo: FileInfo|null = null
  svgFileInfo: FileInfo|null = null

  constructor(
      private admin: AdminService, private formBuilder: FormBuilder, public init: InitService,
      private router: Router, public img: ImageService) {
    this.form = this.formBuilder.group({
      name: [init.venue().name, Validators.required],
      shortName: [init.venue().shortName, Validators.required],
      address: [init.venue().address],
      shiftsWebAddress: [init.venue().shiftsWebAddress],
      webAddress: [init.venue().webAddress],
      verificationEmailTemplateId: [init.venue().verificationEmailTemplateId],
    });
  }

  onSave() {
    const venue: Venue = {
      name: this.form.value.name ?? "",
      shortName: this.form.value.shortName ?? "",
      address: this.form.value.address ?? "",
      pictureName: this.init.venue().pictureName,
      icoPictureName: this.init.venue().icoPictureName,
      svgPictureName: this.init.venue().svgPictureName,
      shiftsWebAddress: this.form.value.shiftsWebAddress ?? "",
      webAddress: this.form.value.webAddress ?? "",
      verificationEmailTemplateId: this.form.value.verificationEmailTemplateId ?? "",
    }

    this.admin.saveVenue(venue)
      .then(() => {
        this.saveComplete();
      })
  }

  saveComplete() {
    if (this.fileInfo != null) {
      // We have to upload the image first.
      this.admin.saveVenuePicture(this.fileInfo.filename, this.fileInfo.file)
        .then(() => {
          this.fileInfo = null
          this.saveComplete()
        });
      return
    }

    if (this.icoFileInfo != null) {
      this.admin.saveVenueIcoPicture(this.icoFileInfo.filename, this.icoFileInfo.file)
        .then(() => {
          this.icoFileInfo = null
          this.saveComplete();
        })
      return
    }

    if (this.svgFileInfo != null) {
      this.admin.saveVenueSvgPicture(this.svgFileInfo.filename, this.svgFileInfo.file)
        .then(() => {
          this.svgFileInfo = null
          this.saveComplete();
        })
      return
    }

    // Instead of navigating, we want to actually reload the page so that the init call happens again.
    window.location.reload();
  }

  imageUpdated(file: FileInfo) {
    this.fileInfo = file
  }
  icoImageUpdated(file: FileInfo) {
    this.icoFileInfo = file
  }
  svgImageUpdated(file: FileInfo) {
    this.svgFileInfo = file
  }
}
