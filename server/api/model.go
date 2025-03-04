package api

import (
	"strings"
	"time"

	"com.codeka/scheduler/server/flags"
	"com.codeka/scheduler/server/notify"
	"com.codeka/scheduler/server/store"
)

type Venue struct {
	Name                        string `json:"name"`
	ShortName                   string `json:"shortName"`
	Address                     string `json:"address"`
	PictureName                 string `json:"pictureName"`
	ShiftsWebAddress            string `json:"shiftsWebAddress"`
	WebAddress                  string `json:"webAddress"`
	VerificationEmailTemplateID string `json:"verificationEmailTemplateId"`
	IcoPictureName              string `json:"icoPictureName"`
	SvgPictureName              string `json:"svgPictureName"`
}

func MakeVenue(venue *store.Venue) *Venue {
	return &Venue{
		Name:                        venue.Name,
		ShortName:                   venue.ShortName,
		Address:                     venue.Address,
		PictureName:                 venue.PictureName,
		ShiftsWebAddress:            venue.ShiftsWebAddress,
		WebAddress:                  venue.WebAddress,
		VerificationEmailTemplateID: venue.VerificationEmailTemplateID,
		IcoPictureName:              venue.IcoPictureName,
		SvgPictureName:              venue.SvgPictureName,
	}
}

func VenueToStore(venue *Venue) *store.Venue {
	return &store.Venue{
		Name:                        venue.Name,
		ShortName:                   venue.ShortName,
		Address:                     venue.Address,
		PictureName:                 venue.PictureName,
		ShiftsWebAddress:            venue.ShiftsWebAddress,
		WebAddress:                  venue.WebAddress,
		VerificationEmailTemplateID: venue.VerificationEmailTemplateID,
		IcoPictureName:              venue.IcoPictureName,
		SvgPictureName:              venue.SvgPictureName,
	}
}

type User struct {
	ID               int64    `json:"id"`
	Name             string   `json:"name"`
	Email            string   `json:"email"`
	Phone            string   `json:"phone"`
	ShareContactInfo bool     `json:"shareContactInfo"`
	PictureName      string   `json:"pictureName"`
	Roles            []string `json:"roles"`
	Groups           []int64  `json:"groups"`
}

// MakeUser converts the given store.User to our User type.
func MakeUser(user *store.User, roles []string, groups []int64) *User {
	if user == nil {
		return nil
	}

	return &User{
		ID:               user.ID,
		Name:             user.Name,
		Email:            user.Email,
		Phone:            user.Phone,
		ShareContactInfo: user.ShareContactInfo,
		PictureName:      user.PictureName,
		Roles:            roles,
		Groups:           groups,
	}
}

func UserToStore(user *User) *store.User {
	return &store.User{
		ID:               user.ID,
		Name:             user.Name,
		Email:            user.Email,
		Phone:            user.Phone,
		ShareContactInfo: user.ShareContactInfo,
		PictureName:      user.PictureName,
	}
}

func SanitizeUser(user *User) {
	if user.ShareContactInfo {
		return
	}

	user.Email = ""
	user.Phone = ""
}

// byName is a helper type so we can sort a list of Users by the name.
type byName []*User

func (users byName) Len() int      { return len(users) }
func (users byName) Swap(i, j int) { users[i], users[j] = users[j], users[i] }
func (users byName) Less(i, j int) bool {
	return strings.Compare(users[i].Name, users[j].Name) < 0
}

type Event struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	// JSON date/times are always in UTC, which is not what we want. We manually format all date/times as
	// yyyy-mm-dd for dates, hh:mm:ss for times, with no timezone information. Events do no span multiple days, the
	// start and ent time all fall on the same date.
	Date      string `json:"date"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

func MakeEvent(event *store.Event) *Event {
	if event == nil {
		return nil
	}

	return &Event{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		Date:        event.Date.Format(time.DateOnly),
		StartTime:   event.StartTime.Format(time.TimeOnly),
		EndTime:     event.EndTime.Format(time.TimeOnly),
	}
}

func EventToStore(event *Event) (*store.Event, error) {
	dt, err := time.Parse(time.DateOnly, event.Date)
	if err != nil {
		return nil, err
	}
	startTime, err := time.Parse(time.TimeOnly, event.StartTime)
	if err != nil {
		return nil, err
	}
	endTime, err := time.Parse(time.TimeOnly, event.EndTime)
	if err != nil {
		return nil, err
	}

	return &store.Event{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		Date:        dt,
		StartTime:   startTime,
		EndTime:     endTime,
	}, nil
}

type Group struct {
	ID               int64   `json:"id"`
	Name             string  `json:"name"`
	MinSignups       int32   `json:"minSignups"`
	AlwaysShow       bool    `json:"alwaysShow"`
	ShiftStartOffset float64 `json:"shiftStartOffset"`
	ShiftEndOffset   float64 `json:"shiftEndOffset"`
}

func GroupToStore(g *Group) *store.Group {
	return &store.Group{
		ID:               g.ID,
		Name:             g.Name,
		MinSignups:       g.MinSignups,
		AlwaysShow:       g.AlwaysShow,
		ShiftStartOffset: time.Duration(g.ShiftStartOffset * float64(time.Hour)),
		ShiftEndOffset:   time.Duration(g.ShiftEndOffset * float64(time.Hour)),
	}
}

func MakeGroup(group *store.Group) *Group {
	if group == nil {
		return nil
	}

	return &Group{
		ID:               group.ID,
		Name:             group.Name,
		MinSignups:       group.MinSignups,
		AlwaysShow:       group.AlwaysShow,
		ShiftStartOffset: group.ShiftStartOffset.Hours(),
		ShiftEndOffset:   group.ShiftEndOffset.Hours(),
	}
}

type ShiftSignup struct {
	// User is the actual user that signed up. We don't include groups or roles. This is slightly inefficient to send
	// the whole user (rather than sending the IDs plus list of users, but it makes the API much simpler). In reality
	// there's not going to be a lot of duplicated users (typically people won't sign up dozens of times)
	User  *User  `json:"user"`
	Notes string `json:"notes"`
}

type Shift struct {
	ID        int64          `json:"id"`
	GroupID   int64          `json:"groupId"`
	Date      string         `json:"date"`
	StartTime string         `json:"startTime"`
	EndTime   string         `json:"endTime"`
	Signups   []*ShiftSignup `json:"signups"`
}

func ShiftToStore(shift *Shift) (*store.Shift, error) {
	dt, err := time.Parse(time.DateOnly, shift.Date)
	if err != nil {
		return nil, err
	}
	startTime, err := time.Parse(time.TimeOnly, shift.StartTime)
	if err != nil {
		return nil, err
	}
	endTime, err := time.Parse(time.TimeOnly, shift.EndTime)
	if err != nil {
		return nil, err
	}

	return &store.Shift{
		ID:        shift.ID,
		GroupID:   shift.GroupID,
		Date:      dt,
		StartTime: startTime,
		EndTime:   endTime,
	}, nil
}

func MakeShift(shift *store.Shift, signups []*store.ShiftSignup, users map[int64]*store.User) *Shift {
	if shift == nil {
		return nil
	}

	var su []*ShiftSignup
	for _, s := range signups {
		if s == nil {
			continue
		}
		su = append(su, &ShiftSignup{
			User:  MakeUser(users[s.UserID], []string{}, []int64{}),
			Notes: s.Notes,
		})
	}

	return &Shift{
		ID:        shift.ID,
		GroupID:   shift.GroupID,
		Date:      shift.Date.Format(time.DateOnly),
		StartTime: shift.StartTime.Format(time.TimeOnly),
		EndTime:   shift.EndTime.Format(time.TimeOnly),
		Signups:   su,
	}
}

type NotificationSetting struct {
	NotificationID          string `json:"notificationId"`
	NotificationDescription string `json:"notificationDescription"`
	EmailEnabled            bool   `json:"emailEnabled"`
	SMSEnabled              bool   `json:"smsEnabled"`
}

func NotificationSettingToStore(user *store.User, setting NotificationSetting) store.NotificationSetting {
	return store.NotificationSetting{
		UserID:         user.ID,
		NotificationID: setting.NotificationID,
		EmailEnabled:   setting.EmailEnabled,
		SMSEnabled:     setting.SMSEnabled,
	}
}

func MakeNotificationSettings(settings map[string]*store.NotificationSetting) []*NotificationSetting {
	var values []*NotificationSetting
	for _, notificationType := range notify.GetNotificationTypes() {
		setting := settings[notificationType.ID]

		values = append(values, &NotificationSetting{
			NotificationID:          notificationType.ID,
			NotificationDescription: notificationType.Description,
			EmailEnabled:            setting.EmailEnabled,
			SMSEnabled:              setting.SMSEnabled,
		})
	}

	return values
}

type NotificationType struct {
	ID                 string `json:"id"`
	Description        string `json:"description"`
	EmailTemplateID    string `json:"emailTemplateId"`
	SMSTemplate        string `json:"smsTemplate"`
	DefaultEmailEnable bool   `json:"defaultEmailEnable"`
	DefaultSMSEnable   bool   `json:"defaultSmsEnable"`
}

func NotificationTypeToStore(notificationType NotificationType) store.NotificationType {
	return store.NotificationType{
		ID:                 notificationType.ID,
		Description:        notificationType.Description,
		EmailTemplateID:    notificationType.EmailTemplateID,
		SmsTemplate:        notificationType.SMSTemplate,
		DefaultEmailEnable: notificationType.DefaultEmailEnable,
		DefaultSMSEnable:   notificationType.DefaultSMSEnable,
	}
}

func MakeNotificationType(notificationType store.NotificationType) NotificationType {
	return NotificationType{
		ID:                 notificationType.ID,
		Description:        notificationType.Description,
		EmailTemplateID:    notificationType.EmailTemplateID,
		SMSTemplate:        notificationType.SmsTemplate,
		DefaultEmailEnable: notificationType.DefaultEmailEnable,
		DefaultSMSEnable:   notificationType.DefaultSMSEnable,
	}
}

type CronJob struct {
	ID       int64      `json:"id"`
	Name     string     `json:"name"`
	Schedule string     `json:"schedule"`
	Enabled  bool       `json:"enabled"`
	NextRun  *time.Time `json:"nextRun"`
}

func CronJobToStore(cronJob CronJob) store.CronJob {
	return store.CronJob{
		ID:       cronJob.ID,
		Name:     cronJob.Name,
		Schedule: cronJob.Schedule,
		Enabled:  cronJob.Enabled,
		NextRun:  cronJob.NextRun,
	}
}

func MakeCronJob(cronJob store.CronJob) CronJob {
	return CronJob{
		ID:       cronJob.ID,
		Name:     cronJob.Name,
		Schedule: cronJob.Schedule,
		Enabled:  cronJob.Enabled,
		NextRun:  cronJob.NextRun,
	}
}

type FeatureFlag struct {
	FlagName string                 `json:"flagName"`
	Enabled  bool                   `json:"enabled"`
	Settings map[string]interface{} `json:"settings"`
}

func MakeFeatureFlag(name string, flag *flags.FeatureFlag) *FeatureFlag {
	return &FeatureFlag{
		FlagName: name,
		Enabled:  flag.Enabled,
		Settings: flag.Settings,
	}
}
