export interface Bike {
  id: string;
  name: string;
  year?: number;
  brand?: string;
  model?: string;
  fork_travel_mm?: number;
  shock_travel_mm?: number;
  wheel_size?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BikeCreate {
  name: string;
  year?: number;
  brand?: string;
  model?: string;
  fork_travel_mm?: number;
  shock_travel_mm?: number;
  wheel_size?: string;
  notes?: string;
}

export interface SuspensionSetup {
  // Fork
  fork_air_pressure_psi?: number;
  fork_hsc?: number;
  fork_lsc?: number;
  fork_hsr?: number;
  fork_lsr?: number;
  fork_tokens?: number;
  // Shock
  shock_air_pressure_psi?: number;
  shock_hsc?: number;
  shock_lsc?: number;
  shock_hsr?: number;
  shock_lsr?: number;
  shock_tokens?: number;
}

export interface TireSetup {
  front_tire_pressure_psi?: number;
  rear_tire_pressure_psi?: number;
  front_tire_model?: string;
  rear_tire_model?: string;
  front_tire_insert?: boolean;
  rear_tire_insert?: boolean;
}

export interface Ride {
  id: string;
  bike_id: string;
  bike?: Bike;
  date: string;
  trail_name: string;
  location?: string;
  conditions?: string;
  duration_minutes?: number;
  distance_miles?: number;
  rating?: number;
  notes?: string;
  suspension_setup: SuspensionSetup;
  tire_setup: TireSetup;
  created_at: string;
  updated_at: string;
}

export interface RideCreate {
  bike_id: string;
  date: string;
  trail_name: string;
  location?: string;
  conditions?: string;
  duration_minutes?: number;
  distance_miles?: number;
  rating?: number;
  notes?: string;
  suspension_setup: SuspensionSetup;
  tire_setup: TireSetup;
}

export type Condition = 'dry' | 'tacky' | 'wet' | 'muddy' | 'snow' | 'loose' | 'hero_dirt';

export interface SetupAnalytics {
  trail_name: string;
  avg_rating: number;
  ride_count: number;
  best_setup: SuspensionSetup & TireSetup;
}
