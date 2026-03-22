from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SetupCreate(BaseModel):
    front_tire_brand: Optional[str] = None
    front_tire_model: Optional[str] = None
    front_tire_pressure_psi: Optional[float] = None
    rear_tire_brand: Optional[str] = None
    rear_tire_model: Optional[str] = None
    rear_tire_pressure_psi: Optional[float] = None

    fork_air_pressure_psi: Optional[float] = None
    fork_rebound_clicks: Optional[int] = None
    fork_compression_clicks: Optional[int] = None
    fork_tokens: Optional[int] = None

    shock_air_pressure_psi: Optional[float] = None
    shock_rebound_clicks: Optional[int] = None
    shock_compression_clicks: Optional[int] = None
    shock_volume_spacers: Optional[int] = None

    notes: Optional[str] = None


class SetupResponse(SetupCreate):
    id: UUID
    ride_id: UUID

    model_config = {"from_attributes": True}
