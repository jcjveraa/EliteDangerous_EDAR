create temp table trades_available_XYZZYX as
select
  listings_in_range_XYZZYX.commodity_id,
  listings_in_range_XYZZYX.sell_for,
  listings_in_current_system_XYZZYX.buy_for,
  listings_in_range_XYZZYX.sell_for - listings_in_current_system_XYZZYX.buy_for as profit_per_unit,
  min(
    floor(@funds_available / listings_in_current_system_XYZZYX.buy_for),
    listings_in_range_XYZZYX.demand,
    @max_cargo_space
  ) as max_units,
  listings_in_current_system_XYZZYX.station_id as buy_from_station_id,
  listings_in_current_system_XYZZYX.system_id as buy_fromsystem_id,
  listings_in_range_XYZZYX.station_id as sell_to_station_id,
  listings_in_range_XYZZYX.system_id as sell_to_system_id,
  listings_in_current_system_XYZZYX.in_system_travel_time + listings_in_range_XYZZYX.in_system_travel_time as total_travel_time
from
  listings_in_current_system_XYZZYX
  join listings_in_range_XYZZYX using(commodity_id)
where
  listings_in_range_XYZZYX.station_id <> listings_in_current_system_XYZZYX.station_id