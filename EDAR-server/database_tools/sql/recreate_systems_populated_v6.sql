DROP TABLE IF EXISTS `systems_populated_v6`;
CREATE TABLE IF NOT EXISTS `systems_populated_v6`  (id INTEGER, X NUMERIC, Y NUMERIC, Z NUMERIC, edsm_id INTEGER, name TEXT, 	PRIMARY KEY(`id`));
CREATE INDEX `system_name` ON `systems_populated_v6` (
	`name`	ASC
);
