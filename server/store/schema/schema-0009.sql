
ALTER TABLE venue ADD shifts_web_address TEXT;
ALTER TABLE venue ADD web_address TEXT;
ALTER TABLE venue ADD verification_email_template_id TEXT;

UPDATE venue SET
  shifts_web_address = '',
  web_address = '',
  verification_email_template_id = '';
  