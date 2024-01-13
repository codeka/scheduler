

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}
