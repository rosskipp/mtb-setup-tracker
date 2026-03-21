from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ride, Setup
from app.schemas import SweetSpot

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

SETUP_FIELDS = [
    "front_tire_pressure_psi",
    "rear_tire_pressure_psi",
    "fork_air_pressure_psi",
    "fork_rebound_clicks",
    "fork_compression_clicks",
    "fork_tokens",
    "shock_air_pressure_psi",
    "shock_rebound_clicks",
    "shock_compression_clicks",
    "shock_volume_spacers",
]


@router.get("/sweet-spots", response_model=list[SweetSpot])
def sweet_spots(
    bike_id: int | None = None,
    min_rating: int = Query(4, ge=1, le=5),
    db: Session = Depends(get_db),
):
    """Find the most common settings for highest-rated rides."""
    results: list[SweetSpot] = []

    for field_name in SETUP_FIELDS:
        col = getattr(Setup, field_name)
        q = (
            db.query(
                col.label("value"),
                func.avg(Ride.rating).label("avg_rating"),
                func.count(Ride.id).label("ride_count"),
            )
            .join(Ride, Setup.ride_id == Ride.id)
            .filter(Ride.rating >= min_rating)
            .filter(col.isnot(None))
        )
        if bike_id is not None:
            q = q.filter(Ride.bike_id == bike_id)

        row = q.group_by(col).order_by(func.count(Ride.id).desc()).first()

        if row:
            results.append(
                SweetSpot(
                    field=field_name,
                    value=float(row.value) if row.value is not None else None,
                    avg_rating=round(float(row.avg_rating), 2),
                    ride_count=row.ride_count,
                )
            )

    return results


@router.get("/trends")
def setup_trends(
    bike_id: int,
    field: str = Query(..., description="Setup field to track over time"),
    db: Session = Depends(get_db),
):
    """Get setup values over time for charting trends."""
    if field not in SETUP_FIELDS:
        return []

    col = getattr(Setup, field)
    rows = (
        db.query(Ride.date, Ride.rating, Ride.trail_name, col.label("value"))
        .join(Setup, Setup.ride_id == Ride.id)
        .filter(Ride.bike_id == bike_id)
        .filter(col.isnot(None))
        .order_by(Ride.date)
        .all()
    )

    return [
        {
            "date": str(r.date),
            "rating": r.rating,
            "trail_name": r.trail_name,
            "value": r.value,
        }
        for r in rows
    ]
