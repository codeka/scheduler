package notify

import (
	"com.codeka/scheduler/server/store"
)

var notificationTypeNames = []string{
	"shift_24hours", "shift_3days", "empty_shift_1week",
}

var notificationTypes []store.NotificationType

func EnsureNotificationTypes() error {
	var err error
	notificationTypes, err = store.LoadNotificationTypes()
	if err != nil {
		return err
	}

	needReload := false
	for _, notificationTypeName := range notificationTypeNames {
		found := false
		for _, notificationType := range notificationTypes {
			if notificationType.ID == notificationTypeName {
				found = true
			}
		}

		if !found {
			notificationType := store.NotificationType{
				ID: notificationTypeName,
			}
			store.SaveNotificationType(notificationType)
			needReload = true
		}
	}

	if needReload {
		notificationTypes, err = store.LoadNotificationTypes()
		if err != nil {
			return err
		}
	}

	return nil
}

// EnsureNotificationSettings is called at startup to make sure all users have a NotificationSetting created for each
// defined NotificationType. We call this to handle any notification types that are created later on.
func EnsureNotificationSettings() error {
	users, err := store.GetUsers()
	if err != nil {
		return nil
	}

	for _, user := range users {
		settings, err := store.GetUserNotificationSettings(user.ID)
		if err != nil {
			continue
		}

		for _, notificationType := range notificationTypes {
			_, ok := settings[notificationType.ID]
			if !ok {
				store.SaveNotificationSetting(store.NotificationSetting{
					UserID:         user.ID,
					NotificationID: notificationType.ID,
					EmailEnabled:   notificationType.DefaultEmailEnable,
					SMSEnabled:     notificationType.DefaultSMSEnable,
				})
			}
		}

		// TODO: if we ever delete a notification type, we'll want to delete them here, too?
	}

	return nil
}

// GetNotificationTypes gets all the notification types.
func GetNotificationTypes() []store.NotificationType {
	return notificationTypes
}
