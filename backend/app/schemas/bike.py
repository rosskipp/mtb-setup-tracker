from typing import Optional
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BikeCreate(BaseModel):
    name: str = Field(..., max_length=100)
    year: Optional[int] = None
    travel_front_mm: Optional[int] = None
    travel_rear_mm: Optional[int] = None
    wheel_size: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None


class BikeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    year: Optional[int] = None
    travel_front_mm: Optional[int] = None
    travel_rear_mm: Optional[int] = None
    wheel_size: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None


class BikeResponse(BaseModel):
    id: UUID
    name: str
    year: Optional[int] = None
    travel_front_mm: Optional[int] = None
    travel_rear_mm: Optional[int] = None
    wheel_size: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
