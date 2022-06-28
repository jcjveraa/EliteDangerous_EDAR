DROP TABLE IF EXISTS `listings_v6`;
CREATE TABLE IF NOT EXISTS `listings_v6`  (id INTEGER,  
station_id INTEGER, 
commodity_id INTEGER, 
supply INTEGER, 
supply_bracket INTEGER, 
buy_price INTEGER, 
sell_price INTEGER, 
demand INTEGER, 
demand_bracket INTEGER, 
collected_at INTEGER);
CREATE INDEX `ids` ON `listings_v6` (
	`station_id`	ASC,
	`commodity_id`	ASC
);