

// Converts the given date to a string that we can pass to the server in JSON. The format of the date returned is

import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

// always "yyyy-mm-dd" with no timezone info.
export function dateToString(dt: Date): string {
  const year = ("000" + dt.getFullYear()).slice(-4)
  const month = ("0" + (dt.getMonth() + 1)).slice(-2)
  const day = ("0" + dt.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

export function timeToString(tm: Date): string {
  const hour = ("0" + tm.getHours()).slice(-2)
  const minute = ("0" + tm.getMinutes()).slice(-2)
  const second = ("0" + tm.getSeconds()).slice(-2)
  return `${hour}:${minute}:${second}`
}

export function stringToDate(str: string): Date {
  const parts = str.split("-");
  if (parts.length != 3) {
    throw "Invalid date: " + str;
  }

  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0);
}

export function stringToTime(str: string): Date {
  const parts = str.split(":");
  if (parts.length != 3) {
    throw "Invalid time: " + str;
  }

  return new Date(0, 0, 0, parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]), 0);
}

// Returns true if the given two dates fall on the same day.
export function sameDay(dt1: Date, dt2: Date): boolean {
  return dt1.getFullYear() == dt2.getFullYear() && dt1.getMonth() == dt2.getMonth() && dt1.getDate() == dt2.getDate()
}

export function formatStartEndTime(startTime: Date, endTime: Date): string {
  var str = "" + startTime.getHours();
  if (startTime.getMinutes() != 0) {
    str += ":" + ("0" + startTime.getMinutes()).slice(-2);
  }
  if (startTime.getHours() < 12 && endTime.getHours() >= 12) {
    str += "am";
  }
  str += "-";
  if (endTime.getHours() > 12) {
    str += "" + (endTime.getHours() - 12);
  } else {
    str += "" + endTime.getHours();
  }
  if (endTime.getMinutes() != 0) {
    str += ":" + ("0" + endTime.getMinutes()).slice(-2);
  }
  if (endTime.getHours() < 12) {
    str += "am";
  } else {
    str += "pm";
  }

  return str;
}
