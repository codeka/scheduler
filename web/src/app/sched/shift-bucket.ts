import { Shift } from "../services/model"
import { stringToTime } from "../util/date.util"

/** A shift "bucket" is a collection of shifts that overlap and consitite one set of people. For
 * example, it's common to have a bunch of shifts in the morning, then a bunch more in the
 * afternoon. Because shifts are not really "associated" with meetings directly (i.e. one shift
 * could cover 2 meetings, etc), this is a way we can group associated shifts together.
 */
export class ShiftBucket {
  shifts = new Map<number, Array<Shift>>()

  startTime: Date
  endTime: Date

  constructor(initialShift: Shift) {
    this.shifts.set(initialShift.groupId, [initialShift])
    this.startTime = stringToTime(initialShift.startTime)
    this.endTime = stringToTime(initialShift.endTime)
  }

  public addShift(shift: Shift) {
    var shifts = this.shifts.get(shift.groupId)
    if (!shifts) {
      shifts = [shift]
    } else {
      shifts.push(shift)
    }
    this.shifts.set(shift.groupId, shifts)
    const shiftStart = stringToTime(shift.startTime)
    const shiftEnd = stringToTime(shift.endTime)
    this.startTime = (this.startTime.valueOf() < shiftStart.valueOf()) ? this.startTime : shiftStart
    this.endTime = (this.endTime.valueOf() > shiftEnd.valueOf()) ? this.endTime : shiftEnd
  }
}
