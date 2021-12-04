select table1.commodity_id, table1.station_id as buy_station_id, 
buy_station_full.name as buy_station_name,
table2.station_id as sell_station_id, 
sell_station_full.name as sell_station_name,
table1.supply, 
	min(table1.buy_price) as buy_price, 
	table2.sell_price as sell_price,
	(max(table2.sell_price)-min(table1.buy_price)) as profit_per_unit, 
	buy_station_full.system_id as buy_system_id, buy_system_full.name as buy_system_name, sell_station_full.system_id  as sell_system_id, sell_system_full.name as sell_system_name
from listings_v6 as table1

INNER join

		(select *, max(sell_price) from listings_v6 where
		listings_v6.station_id in
			(select stations_v6.id as station_id
			from
			(SELECT sp1.id, sp1.edsm_id, sp1.name,
			(sp1.X-sp2.X)*(sp1.X-sp2.X) + (sp1.Y-sp2.Y)*(sp1.Y-sp2.Y) + (sp1.Z-sp2.Z)*(sp1.Z-sp2.Z) AS distance_squared 
			FROM systems_populated_v6 AS sp1
			LEFT JOIN systems_populated_v6 AS sp2
			WHERE sp2.id = @system_id
      @@@TARGET_SYSTEM@@@
      AND distance_squared <= @max_range

			) as systems
			LEFT JOIN stations_v6 ON systems.id = stations_v6.system_id
      WHERE stations_v6.max_landing_pad_size in (@pad_sizes)
      )
		and demand > 0
		and collected_at > @max_age
		group by listings_v6.commodity_id) as table2

on table1.commodity_id = table2.commodity_id

LEFT JOIN stations_v6 as buy_station_full on buy_station_id = buy_station_full.id
LEFT JOIN stations_v6 as sell_station_full on sell_station_id = sell_station_full.id 
LEFT JOIN systems_populated_v6 as buy_system_full on buy_system_full.id = buy_system_id
LEFT JOIN systems_populated_v6 as sell_system_full on sell_system_full.id = sell_system_id


where table1.station_id in

	(select stations_v6.id as station_id from stations_v6 
	where 	stations_v6.system_id = @system_id
	and 	stations_v6.max_landing_pad_size in (@pad_sizes))	

and table1.supply != 0 
and table1.buy_price != 0
group by table1.commodity_id
order by profit_per_unit desc



LIMIT 50000
