export interface Bike {
  id: string;
  name: string;
  year?: number;
  travel_front_mm?: number;
  travel_rear_mm?: number;
  wheel_size?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BikeCreate {
  name: string;
  year?: number;
  travel_front_mm?: number;
  travel_rear_mm?: number;
  wheel_size?: string;
  notes?: string;
}

export interface Setup {
  id: string;
  ride_id: string;
  front_tire_brand?: string;
  front_tire_model?: string;
  front_tire_pressure_psi?: number;
  rear_tire_brand?: string;
  rear_tire_model?: string;
  rear_tire_pressure_psi?: number;
  fork_air_pressure_psi?: number;
  fork_rebound_clicks?: number;
  fork_compression_clicks?: number;
  fork_tokens?: number;
  shock_air_pressure_psi?: number;
  shock_rebound_clicks?: number;
  shock_compression_clicks?: number;
  shock_volume_spacers?: number;
  notes?: string;
}

export interface SetupCreate {
  front_tire_brand?: string;
  front_tire_model?: string;
  front_tire_pressure_psi?: number;
  rear_tire_brand?: string;
  rear_tire_model?: string;
  rear_tire_pressure_psi?: number;
  fork_air_pressure_psi?: number;
  fork_rebound_clicks?: number;
  fork_compression_clicks?: number;
  fork_tokens?: number;
  shock_air_pressure_psi?: number;
  shock_rebound_clicks?: number;
  shock_compression_clicks?: number;
  shock_volume_spacers?: number;
  notes?: string;
}

export type TrailCondition = 'dry' | 'tacky' | 'muddy' | 'wet' | 'mixed';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'cold';

export interface Ride {
  id: string;
  bike_id: string;
  bike?: Bike;
  date: string;
  trail_name: string;
  trail_condition?: TrailCondition;
  weather?: Weather;
  temperature_f?: number;
  duration_minutes?: number;
  rating?: number;
  notes?: string;
  setup?: Setup;
  created_at: string;
}

export interface RideCreate {
  bike_id: string;
  date: string;
  trail_name: string;
  trail_condition?: TrailCondition;
  weather?: Weather;
  temperature_f?: number;
  duration_minutes?: number;
  rating?: number;
  notes?: string;
  setup?: SetupCreate;
}
