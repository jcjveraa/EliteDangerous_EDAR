select table1.commodity_id, table1.station_id as buy_station_id, 
buy_station_full.name as buy_station_name,
table2.station_id as sell_station_id, 
(buy_system_full.X-sell_system_full.X)*(buy_system_full.X-sell_system_full.X)
 + (buy_system_full.Y-sell_system_full.Y)*(buy_system_full.Y-sell_system_full.Y) 
 + (buy_system_full.Z-sell_system_full.Z)*(buy_system_full.Z-sell_system_full.Z)  as jump_distance_LY_Squared,
sell_station_full.name as sell_station_name,
table1.supply, 
	min(table1.buy_price) as buy_price, 
	table2.sell_price as sell_price,
	(max(table2.sell_price)-min(table1.buy_price)) as profit_per_unit, 
	buy_station_full.system_id as buy_system_id, buy_system_full.name as buy_system_name, sell_station_full.system_id  as sell_system_id, sell_system_full.name as sell_system_name
from listings_v6 as table1

INNER join

		(select *, max(sell_price) from listings_v6 where
		listings_v6.station_id = @target_station
		and demand > 0
		group by listings_v6.commodity_id) as table2

on table1.commodity_id = table2.commodity_id

LEFT JOIN stations_v6 as buy_station_full on buy_station_id = buy_station_full.id
LEFT JOIN stations_v6 as sell_station_full on sell_station_id = sell_station_full.id 
LEFT JOIN systems_populated_v6 as buy_system_full on buy_system_full.id = buy_system_id
LEFT JOIN systems_populated_v6 as sell_system_full on sell_system_full.id = sell_system_id


where table1.station_id = @original_station

and table1.supply != 0 
and table1.buy_price != 0
group by table1.commodity_id
order by profit_per_unit desc



LIMIT 50000