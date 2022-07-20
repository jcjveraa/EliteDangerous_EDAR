export interface State {
  id: number;
  name: string;
}

export interface IStation {
  id: number;
  name: string;
  system_id: number;
  updated_at: number;
  max_landing_pad_size: string;
  distance_to_star: number;
  government_id: number;
  government: string;
  allegiance_id: number;
  allegiance: string;
  states: State[];
  type_id: number;
  type: string;
  has_blackmarket: boolean;
  has_market: boolean;
  has_refuel: boolean;
  has_repair: boolean;
  has_rearm: boolean;
  has_outfitting: boolean;
  has_shipyard: boolean;
  has_docking: boolean;
  has_commodities: boolean;
  has_material_trader: boolean;
  has_technology_broker: boolean;
  has_carrier_vendor: boolean;
  has_carrier_administration: boolean;
  has_interstellar_factors: boolean;
  has_universal_cartographics: boolean;
  import_commodities: string[];
  export_commodities: string[];
  prohibited_commodities: string[];
  economies: string[];
  shipyard_updated_at: number;
  outfitting_updated_at: number;
  market_updated_at: number;
  is_planetary: boolean;
  selling_ships: string[];
  selling_modules: number[];
  settlement_size_id: number;
  settlement_size: string;
  settlement_security_id: number;
  settlement_security: string;
  body_id: number;
  controlling_minor_faction_id: number;
  ed_market_id: number;
}
