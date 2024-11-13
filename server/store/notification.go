package store

// GetUserNotificationSettings returns a map of notification ID to the notification setting for all notification
// settings of the given user.
func GetUserNotificationSettings(userID int64) (map[string]*NotificationSetting, error) {
	rows, err := db.Query(`
		SELECT user_id, notification_id, enable_email, enable_sms
		FROM notification_settings
		WHERE user_id = ?`, userID)
	if err != nil {
		return map[string]*NotificationSetting{}, err
	}
	defer rows.Close()

	settings := make(map[string]*NotificationSetting)
	for rows.Next() {
		setting := NotificationSetting{}
		if err = rows.Scan(&setting.UserID, &setting.NotificationID, &setting.EmailEnabled, &setting.SMSEnabled); err != nil {
			continue
		}

		settings[setting.NotificationID] = &setting
	}

	return settings, nil
}

func SaveNotificationSetting(setting NotificationSetting) error {
	// Just delete and re-create the setting.
	// TODO: actually have a unique index or something?
	_, err := db.Exec(`
	  DELETE FROM notification_settings
		WHERE user_id = ? AND notification_id = ?`,
		setting.UserID, setting.NotificationID)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
	  INSERT INTO notification_settings
		  (user_id, notification_id, enable_email, enable_sms)
		VALUES (?, ?, ?, ?)`,
		setting.UserID, setting.NotificationID, setting.EmailEnabled, setting.SMSEnabled)
	return err
}

func SaveNotificationType(notificationType NotificationType) error {
	// Just delete and re-create the type.
	// TODO: actually have a unique index or something?
	_, err := db.Exec(`
		DELETE FROM notification_type
		WHERE id = ?`, notificationType.ID)
	if err != nil {
		return nil
	}

	_, err = db.Exec(`
		INSERT INTO notification_type
			(id, description, email_template_id, sms_template, default_email_enable, default_sms_enable)
		VALUES (?, ?, ?, ?, ?, ?)`,
		notificationType.ID, notificationType.Description, notificationType.EmailTemplateID, notificationType.SmsTemplate,
		notificationType.DefaultEmailEnable, notificationType.DefaultSMSEnable)
	return err
}

func LoadNotificationTypes() ([]NotificationType, error) {
	rows, err := db.Query(`
		SELECT id, description, email_template_id, sms_template, default_email_enable, default_sms_enable
		FROM notification_type
		ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notificationTypes []NotificationType
	for rows.Next() {
		notificationType := NotificationType{}
		if err = rows.Scan(&notificationType.ID, &notificationType.Description, &notificationType.EmailTemplateID,
			&notificationType.SmsTemplate, &notificationType.DefaultEmailEnable,
			&notificationType.DefaultSMSEnable); err != nil {
			return nil, err
		}
		notificationTypes = append(notificationTypes, notificationType)
	}

	return notificationTypes, nil
}
