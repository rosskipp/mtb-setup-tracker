from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Bike(Base):
    __tablename__ = "bikes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    travel_front_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    travel_rear_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wheel_size: Mapped[str | None] = mapped_column(String(10), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    rides: Mapped[list["Ride"]] = relationship(back_populates="bike", cascade="all, delete-orphan")


class Ride(Base):
    __tablename__ = "rides"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bike_id: Mapped[int] = mapped_column(ForeignKey("bikes.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    trail_name: Mapped[str] = mapped_column(String(200), nullable=False)
    trail_condition: Mapped[str | None] = mapped_column(String(20), nullable=True)
    weather: Mapped[str | None] = mapped_column(String(20), nullable=True)
    temperature_f: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    bike: Mapped["Bike"] = relationship(back_populates="rides")
    setup: Mapped["Setup | None"] = relationship(
        back_populates="ride", uselist=False, cascade="all, delete-orphan"
    )


class Setup(Base):
    __tablename__ = "setups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ride_id: Mapped[int] = mapped_column(
        ForeignKey("rides.id"), nullable=False, unique=True
    )

    # Tires
    front_tire_brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    front_tire_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    front_tire_pressure_psi: Mapped[float | None] = mapped_column(Float, nullable=True)
    rear_tire_brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rear_tire_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rear_tire_pressure_psi: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Fork
    fork_air_pressure_psi: Mapped[float | None] = mapped_column(Float, nullable=True)
    fork_rebound_clicks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fork_compression_clicks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fork_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Shock
    shock_air_pressure_psi: Mapped[float | None] = mapped_column(Float, nullable=True)
    shock_rebound_clicks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    shock_compression_clicks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    shock_volume_spacers: Mapped[int | None] = mapped_column(Integer, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    ride: Mapped["Ride"] = relationship(back_populates="setup")
