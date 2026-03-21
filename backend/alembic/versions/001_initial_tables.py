"""initial tables

Revision ID: 001
Revises:
Create Date: 2026-03-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "bikes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("travel_front_mm", sa.Integer(), nullable=True),
        sa.Column("travel_rear_mm", sa.Integer(), nullable=True),
        sa.Column("wheel_size", sa.String(10), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_bikes_id", "bikes", ["id"])

    op.create_table(
        "rides",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("bike_id", sa.Integer(), sa.ForeignKey("bikes.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("trail_name", sa.String(200), nullable=False),
        sa.Column("trail_condition", sa.String(20), nullable=True),
        sa.Column("weather", sa.String(20), nullable=True),
        sa.Column("temperature_f", sa.Integer(), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_rides_id", "rides", ["id"])

    op.create_table(
        "setups",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "ride_id",
            sa.Integer(),
            sa.ForeignKey("rides.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("front_tire_brand", sa.String(100), nullable=True),
        sa.Column("front_tire_model", sa.String(100), nullable=True),
        sa.Column("front_tire_pressure_psi", sa.Float(), nullable=True),
        sa.Column("rear_tire_brand", sa.String(100), nullable=True),
        sa.Column("rear_tire_model", sa.String(100), nullable=True),
        sa.Column("rear_tire_pressure_psi", sa.Float(), nullable=True),
        sa.Column("fork_air_pressure_psi", sa.Float(), nullable=True),
        sa.Column("fork_rebound_clicks", sa.Integer(), nullable=True),
        sa.Column("fork_compression_clicks", sa.Integer(), nullable=True),
        sa.Column("fork_tokens", sa.Integer(), nullable=True),
        sa.Column("shock_air_pressure_psi", sa.Float(), nullable=True),
        sa.Column("shock_rebound_clicks", sa.Integer(), nullable=True),
        sa.Column("shock_compression_clicks", sa.Integer(), nullable=True),
        sa.Column("shock_volume_spacers", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_setups_id", "setups", ["id"])


def downgrade() -> None:
    op.drop_table("setups")
    op.drop_table("rides")
    op.drop_table("bikes")
