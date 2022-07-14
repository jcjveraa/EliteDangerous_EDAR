export interface ITradeFinderResult {
  profit_per_second: number;
  total_profit: number;
  commodity_id: number;
  sell_for: number;
  buy_for: number;
  profit_per_unit: number;
  max_units: number;
  buy_from_station_id: number;
  buy_from_system_id: number;
  sell_to_station_id: number;
  sell_to_system_id: number;
  total_travel_time: number;
}

export interface ITradeFinderResultWithNames extends ITradeFinderResult {
  buy_from_station_name: string;
  buy_from_system_name: string;
  sell_to_station_name: string;
  sell_to_system_name: string;
  commodity_name: string;
}
