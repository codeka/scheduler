
export interface Venue {
  name: string
  shortName: string
  address: string
  pictureName: string
  shiftsWebAddress: string
  webAddress: string
  verificationEmailTemplateId: string
  icoPictureName: string
  svgPictureName: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  shareContactInfo: boolean
  pictureName: string
  roles: string[]
  groups: number[]
}

export interface Event {
  id: number
  title: string
  description: string
	// JSON date/times are always in UTC, which is not what we want. We manually format all date/times as
	// yyyy-mm-dd for dates, hh:mm:ss for times, with no timezone information. Events do no span multiple days, the
	// start and ent time all fall on the same date.
  date: string
  startTime: string
  endTime: string
}

export interface Group {
  id: number
  name: string
  minSignups: number
  alwaysShow: boolean
  shiftStartOffset: number
  shiftEndOffset: number
}

export interface ShiftSignup {
  user: User
  notes: string
}

export interface Shift {
  id: number
  groupId: number
  date: string
  startTime: string
  endTime: string
  signups: ShiftSignup[]
}

export interface NotificationSetting {
  notificationId: string
	notificationDescription?: string
	emailEnabled: boolean
	smsEnabled: boolean
}

export interface CronJob {
  id: number
	name: string
	schedule: string
	enabled: boolean

  // nextRun can be null if the job isn't going to run (e.g. it's disabled) or we haven't yet calculated when it will
  // run (e.g. we're about to save it).
	nextRun: Date|null
}

export interface NotificationType {
  id: string
	description: string
	emailTemplateId: string
	smsTemplate: string
  defaultEmailEnable: boolean
  defaultSmsEnable: boolean
}

export interface FeatureFlag {
  flagName: string
  enabled: boolean
  settings: any
}

export interface DashboardMotd {
  postDate: Date|null
  messageHtml: string
}
