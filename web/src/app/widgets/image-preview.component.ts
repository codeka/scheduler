import { Component } from "@angular/core";




@Component({
  selector: 'image-preview',
  templateUrl: 'image-preview.component.html',
  styleUrls: ['image-preview.component.scss'],
})
export class ImagePreviewComponent {
  previewUrl = ""

  updatePreview(file: File) {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result
    };
    reader.readAsDataURL(file)
  }
}
