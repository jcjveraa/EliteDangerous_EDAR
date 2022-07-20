CREATE INDEX `name_lookup` ON `commodities_v6` (
	`EDDN_name`	ASC
);

CREATE INDEX `ids` ON `listings_v6` (
	`station_id`	ASC,
	`commodity_id`	ASC
);

CREATE INDEX `last_updated` ON `listings_v6` (
	`collected_at`	ASC
);

CREATE INDEX `system_id` ON `stations_v6` (
	`system_id`	ASC,
  `distance_to_star` ASC
);

CREATE INDEX `station_name` ON `stations_v6` (
	`name`	ASC
);

CREATE INDEX `max_landing_pad_size` ON `stations_v6` (
	`max_landing_pad_size`	ASC
);
CREATE INDEX `is_planetary` ON `stations_v6` (
	`is_planetary`	ASC
);

CREATE INDEX `system_name` ON `systems_populated_v6` (
	`name`	ASC
);

DROP VIEW IF EXISTS station_id_lookup;
CREATE VIEW station_id_lookup AS 
SELECT systems_populated_v6.name as system_name, stations_v6.name as station_name, stations_v6.id as station_id
from systems_populated_v6
join stations_v6 on systems_populated_v6.id == stations_v6.system_id;