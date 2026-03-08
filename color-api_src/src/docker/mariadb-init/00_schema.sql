CREATE DATABASE IF NOT EXISTS colorschemes;

USE colorschemes;

CREATE TABLE IF NOT EXISTS color_palette (
  palette_key VARCHAR(64) NOT NULL,
  time_of_day VARCHAR(16) NOT NULL,
  day_type VARCHAR(16) NOT NULL,
  weather VARCHAR(16) NOT NULL,
  background VARCHAR(16) NOT NULL,
  surface VARCHAR(16) NOT NULL,
  primary_color VARCHAR(16) NOT NULL,
  secondary_color VARCHAR(16) NOT NULL,
  PRIMARY KEY (palette_key)
);
