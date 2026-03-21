from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class TrailCondition(str, Enum):
    dry = "dry"
    tacky = "tacky"
    muddy = "muddy"
    wet = "wet"
    mixed = "mixed"


class Weather(str, Enum):
    sunny = "sunny"
    cloudy = "cloudy"
    rainy = "rainy"
    cold = "cold"


# --- Bike ---


class BikeBase(BaseModel):
    name: str
    year: int | None = None
    travel_front_mm: int | None = None
    travel_rear_mm: int | None = None
    wheel_size: str | None = None
    notes: str | None = None


class BikeCreate(BikeBase):
    pass


class BikeUpdate(BaseModel):
    name: str | None = None
    year: int | None = None
    travel_front_mm: int | None = None
    travel_rear_mm: int | None = None
    wheel_size: str | None = None
    notes: str | None = None


class BikeRead(BikeBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Setup ---


class SetupBase(BaseModel):
    front_tire_brand: str | None = None
    front_tire_model: str | None = None
    front_tire_pressure_psi: float | None = None
    rear_tire_brand: str | None = None
    rear_tire_model: str | None = None
    rear_tire_pressure_psi: float | None = None
    fork_air_pressure_psi: float | None = None
    fork_rebound_clicks: int | None = None
    fork_compression_clicks: int | None = None
    fork_tokens: int | None = None
    shock_air_pressure_psi: float | None = None
    shock_rebound_clicks: int | None = None
    shock_compression_clicks: int | None = None
    shock_volume_spacers: int | None = None
    notes: str | None = None


class SetupCreate(SetupBase):
    pass


class SetupUpdate(SetupBase):
    pass


class SetupRead(SetupBase):
    id: int
    ride_id: int

    model_config = {"from_attributes": True}


# --- Ride ---


class RideBase(BaseModel):
    bike_id: int
    date: date
    trail_name: str
    trail_condition: TrailCondition | None = None
    weather: Weather | None = None
    temperature_f: int | None = None
    duration_minutes: int | None = None
    rating: int | None = Field(None, ge=1, le=5)
    notes: str | None = None


class RideCreate(RideBase):
    setup: SetupCreate | None = None


class RideUpdate(BaseModel):
    bike_id: int | None = None
    date: date | None = None
    trail_name: str | None = None
    trail_condition: TrailCondition | None = None
    weather: Weather | None = None
    temperature_f: int | None = None
    duration_minutes: int | None = None
    rating: int | None = Field(None, ge=1, le=5)
    notes: str | None = None
    setup: SetupUpdate | None = None


class RideRead(RideBase):
    id: int
    created_at: datetime
    setup: SetupRead | None = None
    bike: BikeRead | None = None

    model_config = {"from_attributes": True}


# --- Analytics ---


class SetupComparison(BaseModel):
    ride_id: int
    date: date
    trail_name: str
    trail_condition: str | None
    rating: int | None
    setup: SetupRead

    model_config = {"from_attributes": True}


class SweetSpot(BaseModel):
    field: str
    value: float | None
    avg_rating: float
    ride_count: int
