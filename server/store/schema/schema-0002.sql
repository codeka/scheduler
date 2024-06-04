
ALTER TABLE groups ADD COLUMN min_signups INTEGER;
UPDATE groups SET min_signups = 2;
