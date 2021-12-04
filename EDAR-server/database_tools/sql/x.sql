SELECT sp1.id, sp1.edsm_id, sp1.name, stations_v6.id as station_id, stations_v6.max_landing_pad_size,
(sp1.X-sp2.X)*(sp1.X-sp2.X) + (sp1.Y-sp2.Y)*(sp1.Y-sp2.Y) + (sp1.Z-sp2.Z)*(sp1.Z-sp2.Z) AS distance_squared 
FROM systems_populated_v6 AS sp1
LEFT JOIN systems_populated_v6 AS sp2
LEFT JOIN stations_v6 ON sp1.id = stations_v6.system_id
WHERE sp2.id = ? AND distance_squared <= ?
ORDER BY distance_squared ASC;


select * from listings_v6 where listings_v6.station_id in
(select stations_v6.id as station_id from
(SELECT sp1.id, sp1.edsm_id, sp1.name,
(sp1.X-sp2.X)*(sp1.X-sp2.X) + (sp1.Y-sp2.Y)*(sp1.Y-sp2.Y) + (sp1.Z-sp2.Z)*(sp1.Z-sp2.Z) AS distance_squared 
FROM systems_populated_v6 AS sp1
LEFT JOIN systems_populated_v6 AS sp2
WHERE sp2.id = 1 AND distance_squared <= 2000
ORDER BY distance_squared ASC) as yo
LEFT JOIN stations_v6 ON yo.id = stations_v6.system_id)
LIMIT 500000;

-- lowest prices in the system
select *, min(listings_v6.buy_price) from listings_v6 where listings_v6.station_id in
(select listings_v6.commodity_id from listings_v6 where listings_v6.station_id in
	(select stations_v6.id as station_id from stations_v6 where stations_v6.system_id = 12024)	)
	and listings_v6.supply != 0
	and listings_v6.buy_price != 0
	group by listings_v6.commodity_id



--- monster!
select table1.commodity_id, table1.station_id as buy_station, table2.station_id as sell_station, table1.supply, 
	min(table1.buy_price) as buy_price, max(table1.sell_price) as sell_price, (max(table1.sell_price)-min(table1.buy_price)) as profit_per_unit, 
	buy_system.system_id as buy_system, sell_system.system_id  as sell_system

from listings_v6 as table1
	
INNER join
-- START Highest sell price in range
		(select *, max(sell_price) from listings_v6 where 
		listings_v6.station_id in
			(select stations_v6.id as station_id
			from
			(SELECT sp1.id, sp1.edsm_id, sp1.name,
			(sp1.X-sp2.X)*(sp1.X-sp2.X) + (sp1.Y-sp2.Y)*(sp1.Y-sp2.Y) + (sp1.Z-sp2.Z)*(sp1.Z-sp2.Z) AS distance_squared 
			FROM systems_populated_v6 AS sp1
			LEFT JOIN systems_populated_v6 AS sp2
			WHERE sp2.id = 12024 AND distance_squared <= 1000
			--ORDER BY distance_squared ASC
			)as systems
			LEFT JOIN stations_v6 ON systems.id = stations_v6.system_id)
		and
		-- Only commoditys for sale in the current system (12024)
		listings_v6.commodity_id in
			(select listings_v6.commodity_id from listings_v6 where listings_v6.station_id in
			(select stations_v6.id as station_id from stations_v6 where stations_v6.system_id = 12024)
			and listings_v6.supply != 0)
		and demand > 0
		and collected_at > 1638299315
		group by listings_v6.commodity_id) as table2
-- END Highest sell price in range
on table1.commodity_id = table2.commodity_id

LEFT JOIN stations_v6 as buy_system on buy_station = buy_system.id
LEFT JOIN stations_v6 as sell_system on sell_station = sell_system.id 
-- LEFT JOIN systems_populated_v6 on systems_populated_v6.id = buy_system
-- LEFT JOIN systems_populated_v6 on systems_populated_v6.id = sell_system

where table1.station_id in

	(select stations_v6.id as station_id from stations_v6 
	where 	stations_v6.system_id = 12024 
	and 	stations_v6.max_landing_pad_size in ('L', 'M', 'S'))	

and table1.supply != 0 
and table1.buy_price != 0
group by table1.commodity_id
order by profit_per_unit desc



LIMIT 500000
