
ALTER TABLE groups ADD COLUMN always_show INTEGER;
UPDATE groups SET always_show = 0;

ALTER TABLE groups ADD shift_begin_offset_min INTEGER;
ALTER TABLE groups ADD shift_end_offset_min INTEGER;
UPDATE groups SET
  shift_begin_offset_min = 0,
  shift_end_offset_min = 0;
