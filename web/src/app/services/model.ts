

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
  startTime: Date;
  endTime: Date;
}
