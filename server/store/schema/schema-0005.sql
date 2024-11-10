

-- notification_setting contains the notification settings for all users.
CREATE TABLE notification_settings (
  user_id INTEGER,
  notification_id TEXT,
  enable_email INTEGER,
  enable_sms INTEGER
);

CREATE INDEX IX_notification_settings_notification_id ON notification_settings (notification_id);
CREATE INDEX IX_notification_settings_user ON notification_settings (user_id);
