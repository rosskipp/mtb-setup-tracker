from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ride import Ride
from app.models.setup import Setup

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/sweet-spots")
def get_sweet_spots(
    bike_id: str | None = None,
    min_rating: int = Query(default=4, ge=1, le=5),
    db: Session = Depends(get_db),
):
    """Find the most common setup settings for highly-rated rides."""
    query = (
        db.query(Setup)
        .join(Ride, Setup.ride_id == Ride.id)
        .filter(Ride.rating >= min_rating)
    )

    if bike_id:
        query = query.filter(Ride.bike_id == bike_id)

    setups = query.all()

    if not setups:
        return {"message": "No highly-rated rides found", "count": 0, "sweet_spots": {}}

    # Compute averages for numeric fields
    numeric_fields = [
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

    sweet_spots = {}
    for field in numeric_fields:
        values = [getattr(s, field) for s in setups if getattr(s, field) is not None]
        if values:
            sweet_spots[field] = {
                "avg": round(sum(values) / len(values), 1),
                "min": min(values),
                "max": max(values),
                "count": len(values),
            }

    # Most common tire combos
    front_tires = [
        f"{s.front_tire_brand} {s.front_tire_model}"
        for s in setups
        if s.front_tire_brand and s.front_tire_model
    ]
    rear_tires = [
        f"{s.rear_tire_brand} {s.rear_tire_model}"
        for s in setups
        if s.rear_tire_brand and s.rear_tire_model
    ]

    if front_tires:
        sweet_spots["most_common_front_tire"] = max(
            set(front_tires), key=front_tires.count
        )
    if rear_tires:
        sweet_spots["most_common_rear_tire"] = max(
            set(rear_tires), key=rear_tires.count
        )

    return {
        "count": len(setups),
        "min_rating": min_rating,
        "sweet_spots": sweet_spots,
    }


@router.get("/compare")
def compare_trail_setups(
    trail: str = Query(..., description="Trail name to compare setups for"),
    bike_id: str | None = None,
    db: Session = Depends(get_db),
):
    """Compare setups across multiple rides on the same trail."""
    query = (
        db.query(Ride, Setup)
        .outerjoin(Setup, Setup.ride_id == Ride.id)
        .filter(Ride.trail_name.ilike(f"%{trail}%"))
    )

    if bike_id:
        query = query.filter(Ride.bike_id == bike_id)

    results = query.order_by(Ride.date.desc()).all()

    if not results:
        raise HTTPException(
            status_code=404, detail=f"No rides found for trail: {trail}"
        )

    rides = []
    for ride, setup in results:
        entry = {
            "ride_id": str(ride.id),
            "date": ride.date.isoformat(),
            "trail_condition": ride.trail_condition.value if ride.trail_condition else None,
            "weather": ride.weather.value if ride.weather else None,
            "temperature_f": ride.temperature_f,
            "rating": ride.rating,
            "notes": ride.notes,
        }
        if setup:
            entry["setup"] = {
                "front_tire": f"{setup.front_tire_brand or ''} {setup.front_tire_model or ''}".strip() or None,
                "front_tire_pressure_psi": setup.front_tire_pressure_psi,
                "rear_tire": f"{setup.rear_tire_brand or ''} {setup.rear_tire_model or ''}".strip() or None,
                "rear_tire_pressure_psi": setup.rear_tire_pressure_psi,
                "fork_air_pressure_psi": setup.fork_air_pressure_psi,
                "fork_rebound_clicks": setup.fork_rebound_clicks,
                "fork_compression_clicks": setup.fork_compression_clicks,
                "fork_tokens": setup.fork_tokens,
                "shock_air_pressure_psi": setup.shock_air_pressure_psi,
                "shock_rebound_clicks": setup.shock_rebound_clicks,
                "shock_compression_clicks": setup.shock_compression_clicks,
                "shock_volume_spacers": setup.shock_volume_spacers,
            }
        else:
            entry["setup"] = None

        rides.append(entry)

    # Find best setup (highest rated ride with a setup)
    rated_with_setup = [
        r for r in rides if r["rating"] is not None and r["setup"] is not None
    ]
    best = None
    if rated_with_setup:
        best = max(rated_with_setup, key=lambda r: r["rating"])

    return {
        "trail": trail,
        "ride_count": len(rides),
        "rides": rides,
        "best_rated_setup": best,
    }


@router.get("/compare-setups")
def compare_setups(
    bike_id: str = Query(..., description="Bike ID to compare setups for"),
    db: Session = Depends(get_db),
):
    """Return rides grouped by trail for a bike, with setup data for each ride."""
    results = (
        db.query(Ride, Setup)
        .outerjoin(Setup, Setup.ride_id == Ride.id)
        .filter(Ride.bike_id == bike_id)
        .order_by(Ride.trail_name, Ride.date.desc())
        .all()
    )

    if not results:
        return {"bike_id": bike_id, "trails": []}

    grouped: dict[str, list] = defaultdict(list)
    for ride, setup in results:
        entry = {
            "ride_id": str(ride.id),
            "date": ride.date.isoformat(),
            "rating": ride.rating,
            "notes": ride.notes,
            "front_tire_psi": setup.front_tire_pressure_psi if setup else None,
            "rear_tire_psi": setup.rear_tire_pressure_psi if setup else None,
            "fork_psi": setup.fork_air_pressure_psi if setup else None,
            "shock_psi": setup.shock_air_pressure_psi if setup else None,
            "setup_notes": setup.notes if setup else None,
        }
        grouped[ride.trail_name].append(entry)

    trails = []
    for trail_name, rides in grouped.items():
        best_ride_id = None
        rated = [r for r in rides if r["rating"] is not None]
        if rated:
            best_ride_id = max(rated, key=lambda r: r["rating"])["ride_id"]
        trails.append(
            {
                "trail_name": trail_name,
                "rides": rides,
                "best_ride_id": best_ride_id,
            }
        )

    trails.sort(key=lambda t: t["trail_name"])

    return {"bike_id": bike_id, "trails": trails}
