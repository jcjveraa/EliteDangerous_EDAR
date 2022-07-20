CREATE TEMP TABLE listings_in_range_XYZZYX AS
SELECT
  listings_v6.id,
  listings_v6.commodity_id,
  listings_v6.supply,
  listings_v6.buy_price as buy_for,
  listings_v6.demand,
  listings_v6.sell_price as sell_for,
  stations_in_range_XYZZYX.in_system_travel_time,
  stations_in_range_XYZZYX.station_id,
  stations_in_range_XYZZYX.system_id
from
  listings_v6
  join stations_in_range_XYZZYX on stations_in_range_XYZZYX.station_id == listings_v6.station_id
where
  listings_v6.collected_at > @max_age