export interface ITradeFinderResult {
  commodity_id: number;
  buy_station_id: number;
  buy_station_name: string;
  sell_station_id: number;
  sell_station_name: string;
  supply: number;
  buy_price: number;
  sell_price: number;
  profit_per_unit: number;
  buy_system_id: number;
  buy_system_name: string;
  sell_system_id: number;
  sell_system_name: string;
  jump_distance_LY_Squared: number;
  jump_distance_LY?: number;

  maxAttainableOneWay?: {
    units: number;
    totalProfit: number;
  }
  returnTrade?: ITradeFinderResult;
  maxAttainableTwoWayProfit?: number;
}
