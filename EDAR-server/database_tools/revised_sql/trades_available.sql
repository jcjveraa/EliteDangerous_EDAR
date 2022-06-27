drop table if exists trades_available;
create temp table trades_available as
select listings_in_range.commodity_id, listings_in_range.sell_for, listings_in_current_system.buy_for, listings_in_range.sell_for - listings_in_current_system.buy_for as profit_per_unit,
min(floor(100000 / listings_in_current_system.buy_for), listings_in_range.demand, 32) as max_units,
listings_in_current_system.station_id as buy_from_station_id, listings_in_current_system.system_id as buy_fromsystem_id,
listings_in_range.station_id as sell_to_station_id, listings_in_range.system_id as sell_to_system_id,
listings_in_current_system.in_system_travel_time + listings_in_range.in_system_travel_time as total_travel_time

from listings_in_current_system
join listings_in_range using(commodity_id)
where 
listings_in_range.station_id <> listings_in_current_system.station_id
