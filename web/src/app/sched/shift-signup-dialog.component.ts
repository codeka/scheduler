import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { Group, Shift, User } from "../services/model";
import { formatStartEndTime, stringToDate, stringToTime } from "../util/date.util";
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Observable, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from "rxjs";
import { EventsService } from "../services/events.service";

// TODO: include proper stuff here.
export interface DialogData {
  group: Group
  shift: Shift
  user?: string
}

@Component({
  selector: 'shift-signup-dialog',
  templateUrl: './shift-signup-dialog.component.html',
  styleUrls: ['./shift-signup-dialog.component.scss']
})
export class ShiftSignupDialogComponent {
  form: FormGroup<{
    userId: FormControl<string|null>
  }>
  eligibleUsers: Observable<User[]>
  allEligibleUsers: User[]|null = null

  constructor(
    public dialogRef: MatDialogRef<ShiftSignupDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder, private eventsService: EventsService
  ) {
    this.form = this.formBuilder.group({
      userId: ["", Validators.required, this.isUserEligibleValidator()],
    });

    this.eligibleUsers = this.form.controls.userId.valueChanges
        .pipe(
           startWith(''),
           debounceTime(400),
           distinctUntilChanged(),
           switchMap(value => eventsService.getEligibleUserForShift(data.shift, value?.toString() ?? "")))
    this.eligibleUsers
        .pipe(
            map((users) => {
              // The first time we're called, it will include all eligible users, so save them for validation.
              if (this.allEligibleUsers == null) {
                this.allEligibleUsers = users
              }
            })
        ).subscribe()
  }

  shiftTimeStr(shift: Shift): string {
    const startTime = stringToTime(shift.startTime)
    const endTime = stringToTime(shift.endTime)
    return formatStartEndTime(startTime, endTime)
  }

  shiftDateStr(shift: Shift): string {
    const date = stringToDate(shift.date)
    return date.toLocaleString('default', { month: 'short' }) + " " + date.toLocaleString('default', { day: '2-digit' })
  }

  onSave(): void {
    var user: User|undefined

    this.allEligibleUsers?.forEach(value => {
      if (value.name == this.form.value.userId) {
        user = value
      }
    })

    this.eventsService.shiftSignup(this.data.shift, user)

    this.dialogRef.close(user)
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  private isUserEligibleValidator(): AsyncValidatorFn {
    return (ctrl: AbstractControl): Observable<ValidationErrors|null> => {
      var isEligible = false
      this.allEligibleUsers?.forEach(user => {
          if (ctrl.value == user.name) {
            isEligible = true
          }
        })

      return isEligible ? of(null) : of({ inEligibleUser: {} })
    }
  }
}
