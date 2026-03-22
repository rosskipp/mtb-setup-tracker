import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Setup(Base):
    __tablename__ = "setups"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ride_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("rides.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
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

    ride: Mapped["Ride"] = relationship(back_populates="setup")  # noqa: F821
