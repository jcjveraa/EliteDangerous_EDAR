drop table if exists stations_in_range;
CREATE TEMP TABLE stations_in_range as 
	select
					stations_v6.id as station_id, 
					stations_v6.system_id,
					stations_v6.distance_to_star,
					stations_v6.max_landing_pad_size,
					3.6972*power(stations_v6.distance_to_star, 0.4098) + 180 as in_system_travel_time
					
					from 
					stations_v6
					WHERE
					stations_v6.is_planetary == 0
					AND
					stations_v6.max_landing_pad_size >= 2;
					AND
					stations_v6.system_id in 
					(select id from systems_in_range)
					
					
					
					
-- drop table if exists systems_in_range;
-- drop table if exists stations_in_range;
