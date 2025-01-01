
-- Table that contains feature flags for things we want to turn on/off while they
-- are in development.
CREATE TABLE feature_flags (
  flag_name TEXT,
  enabled INTEGER,

  -- Additional settings on a per-flag basis, typically a JSON string.
  settings TEXT
);
