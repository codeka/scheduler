-- Add a name for the 'map', which we expect to be an SVG file.
ALTER TABLE venue ADD map_name TEXT;
UPDATE venue SET map_name = '';
