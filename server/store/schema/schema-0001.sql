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
  address TEXT,
  picture_name TEXT,
);

-- Create an initial fake entry. There should be exact one entry in this table at all times.
INSERT INTO venue (name, short_name, address, picture_name) VALUES ('Sample Center', 'SMPL', '123 Fake St', '');

-- Users are the people who can sign up to help shifts.
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  picture_name TEXT
);

-- Different users can have different roles in the system which gives them different levels of access to things.
CREATE TABLE user_roles (
  user_id NUMBER,
  role_name TEXT
  -- TODO: group-specific roles? e.g. you could be a "shift manager" for SSG group
);

-- Create the initial user (me). Given them all the roles.
INSERT INTO users (name, email, phone) VALUES ('Dean Harding', 'dean@codeka.com', '');
INSERT INTO user_roles(user_id, role_name) SELECT id, 'ADMIN' FROM users;
INSERT INTO user_roles(user_id, role_name) SELECT id, 'EVENT_MANAGER' FROM users;
INSERT INTO user_roles(user_id, role_name) SELECT id, 'SHIFT_MANAGER' FROM users;

-- "Logging in" basically just means you know the secret key from this table. The process goes like this:
-- 1. Enter your email address or phone number
-- 2. We'll send you an email (or text message) with a confirmation_code
-- 3. Once you enter the confirmation code, we'll give you a cookie with the secret for this particular login
-- The browser must present the secret key with every request.
CREATE TABLE user_logins (
  user_id INTEGER,
  -- The confirmation code we send to the user and ask them to enter back to log in.
  confirmation_code TEXT,
  -- The secret key used to identify the user once they've logged in. This will be null until they've given us
  -- the confirmation code back again.
  secret_key TEXT,
  -- The last time we saw this login. 
  last_seen NUMBER
);

-- A group is like SSG or Gajukai. Each event will coincide with one or more shifts from various groups.
CREATE TABLE groups (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- Add some initial groups.
INSERT INTO groups (name) VALUES ('Center in Charge');
INSERT INTO groups (name) VALUES ('Byakuren');
INSERT INTO groups (name) VALUES ('Soka Group');
INSERT INTO groups (name) VALUES ('Gajukai');
INSERT INTO groups (name) VALUES ('SSG');
INSERT INTO groups (name) VALUES ('A/V');
INSERT INTO groups (name) VALUES ('Bookstore');

-- A table that maps users to the groups that user belongs to.
CREATE TABLE user_groups (
  user_id INTEGER,
  group_id INTEGER
);

-- Add the initial user to all the groups.
INSERT INTO user_groups SELECT
  (SELECT MAX(id) FROM users),
  id
FROM groups;

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  -- TODO: add other properties, e.g. colors, somewhere to add agenda/links etc?

  -- We store the date, start time and end time as strings. Events can only begin and end of the same day (i.e. we
  -- do not support overnight events). Date and times are stored in sqlite date() and time() formats.
  date TEXT,
  start_time TEXT,
  end_time TEXT
);

-- A shift typically covers one (or more) events, but technically there does not need to be a correlation between
-- events and shifts.
CREATE TABLE shifts (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,

  -- Date and start/end time are  stored similarly to events.
  date TEXT,
  start_time TEXT,
  end_time TEXT
);

CREATE TABLE shift_users (
  user_id INTEGER,
  shift_id INTEGER,
  -- Any notes you want to associate with your signup, e.g. "sorry I have to leave 10 minutes early" etc.
  notes TEXT
);
