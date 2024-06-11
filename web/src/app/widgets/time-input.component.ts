import { FocusMonitor } from "@angular/cdk/a11y";
import { Component, ElementRef, Inject, Input, Optional, Self } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgControl, NgForm, Validators } from "@angular/forms";
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from "@angular/material/form-field";
import { BaseMatFormFieldControl } from "./base-mat-form-field-control";
import { ErrorStateMatcher } from "@angular/material/core";

@Component({
  selector: 'time-input',
  templateUrl: 'time-input.component.html',
  styleUrls: ['time-input.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: TimeInputComponent}],
  host: {
    '[class.time-input-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
})
export class TimeInputComponent extends BaseMatFormFieldControl<Date|null>  {
  fg: FormGroup<{
    time: FormControl<string|null>
  }>

  constructor(
      fb: FormBuilder, _focusMonitor: FocusMonitor, private _elem: ElementRef,
      @Optional() @Inject(MAT_FORM_FIELD) public _ff: MatFormField,
      @Optional() _parentForm: NgForm,  @Optional() _parentFormGroup: FormGroupDirective,
      @Optional() @Self() ngControl: NgControl, @Optional() defaultErrorStateMatcher: ErrorStateMatcher) {
    super("time-input", _focusMonitor, _elem, ngControl, _parentForm, _parentFormGroup, defaultErrorStateMatcher)

    this.fg = fb.group({
      "time": ["", [Validators.required]],
    })
  }

  @Input()                                                                                  
  public get value(): Date|null {                                                                  
    return this.parseTimeString(this.fg.value.time ?? "")                                   
  }                                                                                         
  public set value(date: Date|null) {                                                              
    date = date || new Date()                                                               
    this.fg.patchValue({                                                                    
      time: `${("00" + date.getHours()).slice(-2)}:${("00" + date.getMinutes()).slice(-2)}` 
    })
    this.onChange?.call(this, date)
    this.stateChanges.next()                                                                
  }                                                                                         
  
  public focus() {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  _handleInput(): void {
    this.onChange?.call(this, this.value);
  }
  
  private parseTimeString(timeStr: string): Date|null {
    var value = timeStr.toLowerCase();
    const parts = value.split(":")
    if (parts.length != 2) {
      return null
    }

    var hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    if (hours < 0 || hours > 23) {
      return null
    }
    if (minutes < 0 || minutes > 59) {
      return null
    }

    return new Date(1, 1, 1, hours, minutes, 0);
  }
}
