import { FocusMonitor } from "@angular/cdk/a11y";
import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, Optional, Self, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, NgControl, NgForm, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from "@angular/material/form-field";
import { Subject } from "rxjs";

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
export class TimeInputComponent implements MatFormFieldControl<Date>, ControlValueAccessor, OnDestroy  {
  static nextId = 0
  @ViewChild('time') timeInput!: HTMLInputElement

  fg: FormGroup<{
    time: FormControl<string|null>
  }>
  private _placeholder: string = ""
  private _required = false
  private _disabled = false
  errorState: boolean = false
  stateChanges = new Subject<void>()
  focused = false
  touched = false
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(
      fb: FormBuilder, private _focusMonitor: FocusMonitor, private _elem: ElementRef,
      @Optional() @Inject(MAT_FORM_FIELD) public _ff: MatFormField,
      @Optional() private _parentForm: NgForm,  @Optional() private _parentFormGroup: FormGroupDirective,
      @Optional() @Self() public ngControl: NgControl) {
    this.fg = fb.group({
      "time": ["", [Validators.required]],
    })

    this.ngControl.valueAccessor = this;
  }

  @HostBinding() id = `time-input-${TimeInputComponent.nextId++}`;

  @Input()
  get value(): Date|null {
    return this.parseTimeString(this.fg.value.time ?? "")
  }
  set value(date: Date|null) {
    date = date || new Date()
    this.fg.patchValue({
      time: `${("00" + date.getHours()).slice(-2)}:${("00" + date.getMinutes()).slice(-2)}`
    })
    this.stateChanges.next()
  }

  writeValue(obj: Date) {
    this.value = obj
  }

  registerOnChange(fn: any) {
     this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  _handleInput(): void {
    this.onChange(this.value);
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  get empty() {
    return !this.fg.value.time
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req: boolean) {
    this._required = req;
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._disabled ? this.fg.disable() : this.fg.enable();
    this.stateChanges.next();
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled
  }

  @Input('aria-describedby') userAriaDescribedBy: string = "";

  setDescribedByIds(ids: string[]) {
    this._elem.nativeElement.querySelector("input").setAttribute("aria-describedby", ids.join(" "));
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elem);
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  onFocusIn(_: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }
  
  onFocusOut(event: FocusEvent) {
    if (!this._elem.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  onContainerClick(event: MouseEvent) {
    this._focusMonitor.focusVia(this.timeInput, "program")
  }

  private updateErrorState() {
    const parent = this._parentFormGroup || this._parentForm;
  
    const oldState = this.errorState;
    const newState = (this.ngControl?.invalid || this.fg.invalid) && (this.focused || parent.submitted);
  
    if (oldState !== newState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
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
