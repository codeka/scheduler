
ALTER TABLE venue ADD ico_picture_name TEXT;
ALTER TABLE venue ADD svg_picture_name TEXT;

UPDATE venue SET ico_picture_name = '';
UPDATE venue SET svg_picture_name = '';