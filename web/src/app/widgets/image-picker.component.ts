import { FocusMonitor } from "@angular/cdk/a11y";
import { Component, ElementRef, EventEmitter, Inject, Optional, Output, Self, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgControl, NgForm, Validators } from "@angular/forms";
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from "@angular/material/form-field";
import { BaseMatFormFieldControl } from "./base-mat-form-field-control";
import { ErrorStateMatcher } from "@angular/material/core";

export class FileInfo {
  constructor(public filename: string, public file: File) {}
}

@Component({
  selector: 'image-picker',
  templateUrl: 'image-picker.component.html',
  styleUrls: ['image-picker.component.scss'],
  providers: [ { provide: MatFormFieldControl, useExisting: ImagePickerComponent } ],
})
export class ImagePickerComponent extends BaseMatFormFieldControl<FileInfo> {
  preview: string = ""

  // We have to use ElementRef to get the actual native element, Angular's HTMLInputElement's click() doesn't work.
  @ViewChild('file') fileInput!: ElementRef

  // Event fired whenever you pick a file.
  @Output('picked') picked = new EventEmitter<FileInfo>()

  fg: FormGroup<{
    filename: FormControl<string|null>
  }>

  constructor(fb: FormBuilder, focusMonitor: FocusMonitor, elem: ElementRef,
    @Optional() @Inject(MAT_FORM_FIELD) public _ff: MatFormField,
    @Optional() parentForm: NgForm,  @Optional() parentFormGroup: FormGroupDirective,
    @Optional() defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() ngControl: NgControl) {
    super("image-picker", focusMonitor, elem, ngControl, parentForm, parentFormGroup, defaultErrorStateMatcher)

    this.fg = fb.group({
      filename: [{ value:"", disabled: true }],
    })
  }
  
  public focus() {
    // TODO
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
      this.value = {
        filename: files[0].name,
        file: files[0]
      }
      this.fg.value.filename = files[0].name
      this.fg.controls.filename.setValue(files[0].name)
      this.picked.emit(this.value)
    }
    
    // Reset it so that if you pick the same file again, we'll be called again.
    target.value = ""
    return true
  }
}
