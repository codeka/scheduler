
-- Table that contains the status of all notifications we've sent. So we can track them.
CREATE TABLE notification_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- User this reminder was sent to.
  user_id INTEGER,
  -- The SendGrid template that we sent
  template_id TEXT,
  -- The additional arguments we passed to SendGrid, serialized as JSON
  extra_args TEXT
);

-- Site-specific settings about each notification.
CREATE TABLE notification_type (
  -- The ID of this notification, the string we used to identify it in code.
  id TEXT,
  -- User-visible description of this notification.
  description TEXT,
  -- The SendGrid email template ID to use for this notification.
  email_template_id TEXT,
  -- The full temaplte of the SMS message to use for this notification.
  sms_template TEXT,
  -- Should we enable email/sms notifications for this type by default?
  default_email_enable INTEGER,
  default_sms_enable INTEGER
);
