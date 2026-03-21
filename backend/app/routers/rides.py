from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Ride, Setup
from app.schemas import RideCreate, RideRead, RideUpdate, TrailCondition

router = APIRouter(prefix="/api/rides", tags=["rides"])


@router.get("", response_model=list[RideRead])
def list_rides(
    bike_id: int | None = None,
    trail_name: str | None = None,
    trail_condition: TrailCondition | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Ride)
        .options(joinedload(Ride.setup), joinedload(Ride.bike))
        .order_by(Ride.date.desc())
    )
    if bike_id is not None:
        q = q.filter(Ride.bike_id == bike_id)
    if trail_name is not None:
        q = q.filter(Ride.trail_name.ilike(f"%{trail_name}%"))
    if trail_condition is not None:
        q = q.filter(Ride.trail_condition == trail_condition.value)
    return q.offset(offset).limit(limit).all()


@router.get("/latest-setup")
def get_latest_setup(bike_id: int, db: Session = Depends(get_db)):
    """Get the most recent setup for a bike to pre-fill the log ride form."""
    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup))
        .filter(Ride.bike_id == bike_id)
        .order_by(Ride.date.desc())
        .first()
    )
    if not ride or not ride.setup:
        return None
    return ride.setup


@router.get("/{ride_id}", response_model=RideRead)
def get_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup), joinedload(Ride.bike))
        .filter(Ride.id == ride_id)
        .first()
    )
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride


@router.post("", response_model=RideRead, status_code=201)
def create_ride(data: RideCreate, db: Session = Depends(get_db)):
    ride_data = data.model_dump(exclude={"setup"})
    ride = Ride(**ride_data)
    db.add(ride)
    db.flush()

    if data.setup:
        setup = Setup(ride_id=ride.id, **data.setup.model_dump())
        db.add(setup)

    db.commit()
    return (
        db.query(Ride)
        .options(joinedload(Ride.setup), joinedload(Ride.bike))
        .filter(Ride.id == ride.id)
        .first()
    )


@router.put("/{ride_id}", response_model=RideRead)
def update_ride(ride_id: int, data: RideUpdate, db: Session = Depends(get_db)):
    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup), joinedload(Ride.bike))
        .filter(Ride.id == ride_id)
        .first()
    )
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride_fields = data.model_dump(exclude={"setup"}, exclude_unset=True)
    for key, value in ride_fields.items():
        setattr(ride, key, value)

    if data.setup is not None:
        setup_data = data.setup.model_dump(exclude_unset=True)
        if ride.setup:
            for key, value in setup_data.items():
                setattr(ride.setup, key, value)
        else:
            ride.setup = Setup(ride_id=ride.id, **setup_data)

    db.commit()
    db.refresh(ride)
    return ride


@router.delete("/{ride_id}", status_code=204)
def delete_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.get(Ride, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    db.delete(ride)
    db.commit()
