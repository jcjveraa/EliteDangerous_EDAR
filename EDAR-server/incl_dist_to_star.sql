select *, profit / in_system_travel_time as profit_per_second_travel from (
select listings_v6.id, system_id, station_id, commodity_id, supply, supply_bracket, buy_price, sell_price, demand, demand_bracket, collected_at, 
3.6972*power(distance_to_star, 0.4098) + 180 as in_system_travel_time,
sell_price - buy_price as profit
from listings_v6 
join stations_v6 on stations_v6.id = station_id

where
		listings_v6.station_id in
			(select stations_v6.id as station_id
			from
			(SELECT sp1.id, sp1.edsm_id, sp1.name,
			(sp1.X-sp2.X)*(sp1.X-sp2.X) + (sp1.Y-sp2.Y)*(sp1.Y-sp2.Y) + (sp1.Z-sp2.Z)*(sp1.Z-sp2.Z) AS distance_squared 
			FROM systems_populated_v6 AS sp1
			LEFT JOIN systems_populated_v6 AS sp2
			WHERE sp2.id = 12024
      AND distance_squared <= 100

			) as systems_in_range
			LEFT JOIN stations_v6 ON systems_in_range.id = stations_v6.system_id
      WHERE stations_v6.max_landing_pad_size >= 0
      )
		and demand > 0
		and strftime('%s') - collected_at < 3*24*3600
-- 		order by listings_v6.commodity_id 
		
		)
		
order by profit_per_second_travel desc