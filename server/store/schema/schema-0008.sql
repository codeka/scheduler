
ALTER TABLE users ADD share_contact_info INTEGER;
UPDATE users SET share_contact_info = 1;
