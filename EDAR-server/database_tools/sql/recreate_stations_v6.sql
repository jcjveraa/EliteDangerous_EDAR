DROP TABLE IF EXISTS `stations_v6`;
CREATE TABLE IF NOT EXISTS `stations_v6`  (id INTEGER, system_id INTEGER, max_landing_pad_size INTEGER, distance_to_star INTEGER, name TEXT, is_planetary INTEGER, 	PRIMARY KEY(`id`));
CREATE INDEX `system_id` ON `stations_v6` (
	`system_id`	ASC,
  `distance_to_star` ASC
);
CREATE INDEX `max_landing_pad_size` ON `stations_v6` (
	`max_landing_pad_size`	ASC
);
CREATE INDEX `is_planetary` ON `stations_v6` (
	`is_planetary`	ASC
);