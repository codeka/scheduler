

export interface Venue {
  name: string;
  shortName: string;
  address: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  roles: string[];
}

export interface Event {
  id: number;
  title: string;
  description: string;
	// JSON date/times are always in UTC, which is not what we want. We manually format all date/times as
	// yyyy-mm-dd for dates, hh:mm:ss for times, with no timezone information. Events do no span multiple days, the
	// start and ent time all fall on the same date.
  date: string
  startTime: string;
  endTime: string;
}
