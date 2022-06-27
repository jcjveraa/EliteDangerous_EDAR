drop table if exists listings_in_range;
CREATE TEMP TABLE listings_in_range AS
SELECT 
listings_v6.id, listings_v6.commodity_id, listings_v6.supply, listings_v6.buy_price as buy_for, listings_v6.demand, listings_v6.sell_price as sell_for,
stations_in_range.in_system_travel_time, stations_in_range.station_id, stations_in_range.system_id
from listings_v6
join stations_in_range
on stations_in_range.station_id == listings_v6.station_id
where STRFTIME('%s') - listings_v6.collected_at > 3 * 24 * 3600
