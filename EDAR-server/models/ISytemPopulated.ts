

export interface State {
      id: number;
      name: string;
  }

export interface ActiveState {
      id: number;
      name: string;
  }

export interface MinorFactionPresence {
      happiness_id: number;
      minor_faction_id: number;
      influence: number;
      active_states: ActiveState[];
      pending_states: unknown[];
      recovering_states: unknown[];
  }

export interface ISystemPopulated {
      id: number;
      edsm_id: number;
      name: string;
      x: number;
      y: number;
      z: number;
      population: number;
      is_populated: boolean;
      government_id: number;
      government: string;
      allegiance_id: number;
      allegiance: string;
      states: State[];
      security_id: number;
      security: string;
      primary_economy_id: number;
      primary_economy: string;
      power?: unknown;
      power_state?: unknown;
      power_state_id?: unknown;
      needs_permit: boolean;
      updated_at: number;
      minor_factions_updated_at: number;
      simbad_ref: string;
      controlling_minor_faction_id: number;
      controlling_minor_faction: string;
      reserve_type_id: number;
      reserve_type: string;
      minor_faction_presences: MinorFactionPresence[];
      ed_system_address: number;
  }
