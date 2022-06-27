select trades_available.profit_per_unit * trades_available.max_units / trades_available.total_travel_time as profit_per_second,
trades_available.profit_per_unit * trades_available.max_units as total_profit,
* 
from trades_available
where trades_available.buy_from_station_id == 219
order by profit_per_second desc

limit 10