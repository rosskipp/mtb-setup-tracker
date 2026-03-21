from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Ride, Setup
from app.schemas import SetupComparison

router = APIRouter(prefix="/api/setups", tags=["setups"])


@router.get("/compare", response_model=list[SetupComparison])
def compare_setups(
    trail_name: str = Query(..., description="Trail name to compare setups for"),
    bike_id: int | None = None,
    db: Session = Depends(get_db),
):
    """Compare setups across rides for the same trail."""
    q = (
        db.query(Ride)
        .options(joinedload(Ride.setup))
        .filter(Ride.trail_name.ilike(f"%{trail_name}%"))
        .filter(Ride.setup.has())
    )
    if bike_id is not None:
        q = q.filter(Ride.bike_id == bike_id)

    rides = q.order_by(Ride.date.desc()).all()

    return [
        SetupComparison(
            ride_id=r.id,
            date=r.date,
            trail_name=r.trail_name,
            trail_condition=r.trail_condition,
            rating=r.rating,
            setup=r.setup,
        )
        for r in rides
    ]
