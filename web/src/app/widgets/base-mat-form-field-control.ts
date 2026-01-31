import { FocusMonitor } from "@angular/cdk/a11y"
import { coerceBooleanProperty } from "@angular/cdk/coercion"
import { Directive, DoCheck, ElementRef, HostBinding, HostListener, Input, OnDestroy } from "@angular/core"
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from "@angular/forms"
import { ErrorStateMatcher, _ErrorStateTracker  } from "@angular/material/core"
import { MatFormFieldControl } from "@angular/material/form-field"
import { Subject } from "rxjs"

class _BaseMatFormField {
  stateChanges = new Subject<void>()

  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

@Directive()
export abstract class BaseMatFormFieldControl<T>
    extends _BaseMatFormField
    implements MatFormFieldControl<T>, DoCheck, OnDestroy, ControlValueAccessor {

  readonly errorStateTracker = new _ErrorStateTracker(
    this._defaultErrorStateMatcher,
    this.ngControl,
    this._parentFormGroup,
    this._parentForm,
    this.stateChanges
  );

  get errorState() {
    return this.errorStateTracker.errorState;
  }

  updateErrorState() {
    this.errorStateTracker.updateErrorState();
  }

  protected onChange?: (value: T) => void;
  protected onTouched?: () => void;

  private static nextId: number = 0;

  public focused = false;

  @HostBinding()
  public id: string = `${this.controlType}-${BaseMatFormFieldControl.nextId++}`;

  @HostBinding("attr.aria-describedBy")
  public describedBy: string = "";

  constructor(
      public readonly controlType: string, protected readonly _focusMonitor: FocusMonitor,
      protected readonly _elementRef: ElementRef, ngControl: NgControl, parentForm: NgForm,
      parentFormGroup: FormGroupDirective, defaultErrorStateMatcher: ErrorStateMatcher) {
    super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    _focusMonitor
      .monitor(this._elementRef.nativeElement, true)
      .subscribe(origin => {
        this.focused = !!origin;
        this.stateChanges.next();
      });
  }

  public ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  public registerOnChange(fn: (_: T) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public writeValue(value: T): void {
    this.value = value;
  }

  public abstract set value(value: T)
  public abstract get value(): T
  public abstract focus(): void;

  public get empty(): boolean {
    return !this.value;
  }

  public setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(" ");
  }

  public _placeholder: string = "";

  @Input()
  public set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  public get placeholder() {
    return this._placeholder;
  }

  public _required: boolean = false;

  @Input()
  public set required(required: any) {
    this._required = coerceBooleanProperty(required);
    this.stateChanges.next();
  }

  public get required() {
    return this._required;
  }

  public _disabled: boolean = false;

  @Input()
  public set disabled(disabled: any) {
    this._disabled = coerceBooleanProperty(disabled);

    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }

  public get disabled() {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }

  @HostListener("focusout")
  onBlur() {
    this.focused = false;
    if (this.onTouched) {
      this.onTouched();
    }
    this.stateChanges.next();
  }

  public get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  public onContainerClick(): void {
    if (!this.focused) {
      this.focus();
    }
  }
}
