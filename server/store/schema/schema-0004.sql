
ALTER TABLE users ADD deleted INTEGER;
UPDATE users SET
  deleted = 0;
