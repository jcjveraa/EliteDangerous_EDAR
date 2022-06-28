select
  trades_available_XYZZYX.profit_per_unit * trades_available_XYZZYX.max_units / trades_available_XYZZYX.total_travel_time as profit_per_second,
  trades_available_XYZZYX.profit_per_unit * trades_available_XYZZYX.max_units as total_profit,
  *
from
  trades_available_XYZZYX
where
  trades_available_XYZZYX.buy_from_station_id == @current_station_id
order by
  profit_per_second desc
limit
  @limit