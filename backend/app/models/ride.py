import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TrailCondition(str, enum.Enum):
    DRY = "dry"
    TACKY = "tacky"
    MUDDY = "muddy"
    WET = "wet"
    MIXED = "mixed"


class Weather(str, enum.Enum):
    SUNNY = "sunny"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    COLD = "cold"


class Ride(Base):
    __tablename__ = "rides"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    bike_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bikes.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    trail_name: Mapped[str] = mapped_column(String(200), nullable=False)
    trail_condition: Mapped[TrailCondition | None] = mapped_column(
        Enum(TrailCondition, name="trail_condition", native_enum=True), nullable=True
    )
    weather: Mapped[Weather | None] = mapped_column(
        Enum(Weather, name="weather", native_enum=True), nullable=True
    )
    temperature_f: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    bike: Mapped["Bike"] = relationship(back_populates="rides")  # noqa: F821
    setup: Mapped["Setup | None"] = relationship(  # noqa: F821
        back_populates="ride", uselist=False, cascade="all, delete-orphan"
    )
