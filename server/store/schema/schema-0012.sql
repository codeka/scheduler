
ALTER TABLE users ADD confirmation_code TEXT;
UPDATE users SET confirmation_code = '';
