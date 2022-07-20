export interface Category {
  id: number;
  name: string;
}

export interface ICommodity {
  id: number;
  name: string;
  category_id: number;
  average_price: number;
  is_rare: number;
  max_buy_price: number;
  max_sell_price: number;
  min_buy_price: number;
  min_sell_price: number;
  buy_price_lower_average: number;
  sell_price_upper_average: number;
  is_non_marketable: number;
  ed_id: number;
  category: Category;
}
