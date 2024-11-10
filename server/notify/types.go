package notify

import "com.codeka/scheduler/server/store"

var NotificationTypes = []store.NotificationType{
	{
		ID:                  "shift_24hrs",
		Description:         "Shift reminder, sent 24 hours before the shift.",
		DefaultEmailEnabled: false,
		DefaultSMSEnabled:   true,
	},
	{
		ID:                  "shift_3days",
		Description:         "Shift reminder, sent 3 days before the shift.",
		DefaultEmailEnabled: true,
		DefaultSMSEnabled:   false,
	},
	{
		ID:                  "empty_shift_1week",
		Description:         "Notification of a shift that isn't full, sent 1 week before the shift.",
		DefaultEmailEnabled: false,
		DefaultSMSEnabled:   false,
	},
	// TODO: add more?
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

		for _, notificationType := range NotificationTypes {
			_, ok := settings[notificationType.ID]
			if !ok {
				store.SaveNotificationSetting(store.NotificationSetting{
					UserID:         user.ID,
					NotificationID: notificationType.ID,
					EmailEnabled:   notificationType.DefaultEmailEnabled,
					SMSEnabled:     notificationType.DefaultSMSEnabled,
				})
			}
		}

		// TODO: if we ever delete a notification type, we'll want to delete them here, too?
	}

	return nil
}
