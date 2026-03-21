export interface Bike {
  id: number;
  name: string;
  year: number | null;
  travel_front_mm: number | null;
  travel_rear_mm: number | null;
  wheel_size: string | null;
  notes: string | null;
  created_at: string;
}

export interface Setup {
  id: number;
  ride_id: number;
  front_tire_brand: string | null;
  front_tire_model: string | null;
  front_tire_pressure_psi: number | null;
  rear_tire_brand: string | null;
  rear_tire_model: string | null;
  rear_tire_pressure_psi: number | null;
  fork_air_pressure_psi: number | null;
  fork_rebound_clicks: number | null;
  fork_compression_clicks: number | null;
  fork_tokens: number | null;
  shock_air_pressure_psi: number | null;
  shock_rebound_clicks: number | null;
  shock_compression_clicks: number | null;
  shock_volume_spacers: number | null;
  notes: string | null;
}

export interface Ride {
  id: number;
  bike_id: number;
  date: string;
  trail_name: string;
  trail_condition: string | null;
  weather: string | null;
  temperature_f: number | null;
  duration_minutes: number | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
  setup: Setup | null;
  bike: Bike | null;
}

export type TrailCondition = "dry" | "tacky" | "muddy" | "wet" | "mixed";
export type Weather = "sunny" | "cloudy" | "rainy" | "cold";

export interface SweetSpot {
  field: string;
  value: number | null;
  avg_rating: number;
  ride_count: number;
}

export interface TrendPoint {
  date: string;
  rating: number | null;
  trail_name: string;
  value: number;
}
