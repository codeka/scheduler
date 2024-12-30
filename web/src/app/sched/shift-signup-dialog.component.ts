import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";

import { Group, Shift, ShiftSignup, User } from "../services/model";
import { formatStartEndTime, stringToDate, stringToTime } from "../util/date.util";
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { EMPTY, Observable, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from "rxjs";
import { EventsService } from "../services/events.service";
import { confirmAction } from "../widgets/confirm-dialog";
import { AuthService } from "../services/auth.service";
import { InitService } from "../services/init.service";

// TODO: include proper stuff here.
export interface DialogData {
  group: Group
  shift: Shift
  user?: string
  signup?: ShiftSignup
}

@Component({
  selector: 'shift-signup-dialog',
  templateUrl: './shift-signup-dialog.component.html',
  styleUrls: ['./shift-signup-dialog.component.scss']
})
export class ShiftSignupDialogComponent implements OnInit {
  form: FormGroup<{
    userId: FormControl<string|null>,
    notes: FormControl<string|null>,
  }>
  eligibleUsers: Observable<User[]>
  allEligibleUsers: User[]|null = null

  constructor(
    public dialogRef: MatDialogRef<ShiftSignupDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog, private formBuilder: FormBuilder, private eventsService: EventsService,
    private init: InitService, public auth: AuthService
  ) {
    this.form = this.formBuilder.group({
      userId: [
        {value: this.init.user()?.name || "", disabled: !!data.signup},
        Validators.required, this.isUserEligibleValidator()],
      notes: [""],
    });

    if (auth.isInRole("SHIFT_MANAGER")) {
      // Save the list of all eligible users first.
      eventsService.getEligibleUserForShift(data.shift, "").then((users) => {
        this.allEligibleUsers = users
      })

      this.eligibleUsers = this.form.controls.userId.valueChanges
          .pipe(
            startWith(''),
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(value => eventsService.getEligibleUserForShift(data.shift, value?.toString() ?? "")))
    } else {
      this.eligibleUsers = EMPTY
    }
  }

  public ngOnInit(): void {
    this.form.patchValue({
      userId: this.auth.isInRole("SHIFT_MANAGER") && this.data.signup?.user.name ? this.data.signup?.user.name : this.init.user()?.name,
      notes: this.data.signup?.notes || ""
    })
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
    var user: User|undefined = this.init.user()

    if (this.auth.isInRole("SHIFT_MANAGER")) {
      this.allEligibleUsers?.forEach(value => {
        if (value.name == this.form.value.userId) {
          user = value
        }
      })
    }

    this.eventsService.shiftSignup(this.data.shift, user, this.form.value.notes ?? "")

    this.dialogRef.close(user)
  }

  onDelete(): void {
    const signupUserId = this.data.signup?.user.id
    if (!signupUserId) {
      return
    }

    confirmAction(this.dialog, {
        msg: "Are you sure you want to cancel this sign up? If you cannot no longer make it, please also contact " +
             "your leader so that they are aware.",
        title: "Remove signup",
        confirmButtonLabel: "REMOVE SIGNUP"
      }).then(() => {
      this.eventsService.deleteShiftSignup(this.data.shift.id, signupUserId).then(() => {
        // TODO: if there was an error, show it.
        this.dialogRef.close()
        this.ngOnInit();
      })
    })
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
