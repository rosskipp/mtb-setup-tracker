from typing import Optional
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.ride import TrailCondition, Weather
from app.schemas.setup import SetupCreate, SetupResponse


class RideCreate(BaseModel):
    bike_id: UUID
    date: date
    trail_name: str = Field(..., max_length=200)
    trail_condition: TrailCondition | None = None
    weather: Weather | None = None
    temperature_f: Optional[float] = None
    duration_minutes: Optional[int] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    setup: SetupCreate | None = None


class RideUpdate(BaseModel):
    bike_id: UUID | None = None
    date: Optional[date] = None
    trail_name: Optional[str] = Field(None, max_length=200)
    trail_condition: TrailCondition | None = None
    weather: Weather | None = None
    temperature_f: Optional[float] = None
    duration_minutes: Optional[int] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    setup: SetupCreate | None = None


class RideResponse(BaseModel):
    id: UUID
    bike_id: UUID
    date: date
    trail_name: str
    trail_condition: TrailCondition | None = None
    weather: Weather | None = None
    temperature_f: Optional[float] = None
    duration_minutes: Optional[int] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    setup: SetupResponse | None = None

    model_config = {"from_attributes": True}
