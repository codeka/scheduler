-- schema_version is used to know when we need to run new scripts to update the schema.
CREATE TABLE schema_version (
  version INTEGER
);

-- Initially, we're at version 1.
INSERT INTO schema_version (version) VALUES (1);

-- venue has exactly one row and describes the venue we're scheduling events for.
CREATE TABLE venue (
  name TEXT,
  short_name TEXT,
  address TEXT
);

-- Create an initial fake entry. There should be exact one entry in this table at all times.
INSERT INTO venue (name, short_name, address) VALUES ('Sample Center', 'SMPL', '123 Fake St');

-- Users are the people who can sign up to help shifts.
CREATE TABLE users (
  id NUMBER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT
);

-- Different users can have different roles in the system which gives them different levels of access to things.
CREATE TABLE user_roles (
  user_id NUMBER,
  role_name TEXT
  -- TODO: group-specific roles? e.g. you could be a "shift manager" for SSG group
);

-- Create the initial user (me).
INSERT INTO users (name, email, phone) VALUES ('Dean Harding', 'dean@codeka.com', '');
INSERT INTO user_roles(user_id, role_name) SELECT id, 'ADMIN' FROM users;

-- "Logging in" basically just means you know the secret key from this table. The process goes like this:
-- 1. Enter your email address or phone number
-- 2. We'll send you an email (or text message) with a confirmation_code
-- 3. Once you enter the confirmation code, we'll give you a cookie with the secret for this particular login
-- The browser must present the secret key with every request.
CREATE TABLE user_logins (
  user_id NUMBER,
  -- The confirmation code we send to the user and ask them to enter back to log in.
  confirmation_code TEXT,
  -- The secret key used to identify the user once they've logged in. This will be null until they've given us
  -- the confirmation code back again.
  secret_key TEXT,
  -- The last time we saw this login. 
  last_login NUMBER
);
