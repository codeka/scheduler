
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MatFormFieldControl } from "@angular/material/form-field";

export class FileInfo {
  constructor(public filename: string, public file: File) {}
}

@Component({
  selector: 'image-picker',
  templateUrl: 'image-picker.component.html',
  styleUrls: ['image-picker.component.scss'],
  providers: [ { provide: MatFormFieldControl, useExisting: ImagePickerComponent } ],
})
export class ImagePickerComponent {
  previewUrl: string = ""
  file: File|null = null
  filename: string = ""

  // We have to use ElementRef to get the actual native element, Angular's HTMLInputElement's click() doesn't work.
  @ViewChild('file') fileInput!: ElementRef
  @ViewChild('img') img!: ElementRef
  @ViewChild('preview') preview!: ElementRef

  // If set, this will be the initial image we'll load up.
  @Input()
  set initialImg(value: string) {
    if (this.file == null) {
      // Only if you haven't picted your own file yet.
      this.previewUrl = value
    }
  }

  // Event fired whenever you pick a file.
  @Output('picked') picked = new EventEmitter<FileInfo>()

  constructor() {
  }

  selectFile(event?: Event) {
    if (event != null) {
      event.preventDefault()
    }

    this.fileInput.nativeElement.click();
  }

  fileSelected(event: Event): boolean {
    const target = event.target as HTMLInputElement
    const files = target.files as FileList

    if (files.length > 0) {
      this.filename = files[0].name,
      this.file = files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.previewUrl = reader.result as string
      }
      reader.readAsDataURL(this.file)
    }

    // Reset it so that if you pick the same file again, we'll be called again.
    target.value = ""
    return true
  }

  imageLoaded() {
    const img = this.img.nativeElement
    var imgWidth = img.width
    var imgHeight = img.height
    const previewWidth = this.preview.nativeElement.clientWidth
    const previewHeight = this.preview.nativeElement.clientHeight
    if (imgWidth > imgHeight) {
      if (imgWidth > previewWidth) {
        img.style.width = previewWidth + "px"
        img.style.height = Math.round(previewWidth * (imgHeight / imgWidth)) + "px"
      }
    } else {
      if (imgHeight > previewHeight) {
        img.style.height = previewHeight + "px"
        img.style.width = Math.round(previewHeight * (imgWidth / imgHeight)) + "px"
      }
    }

    img.style.display = "block"

    this.picked.emit({
      filename: this.filename,
      file: this.file!,
    })
  }
}
