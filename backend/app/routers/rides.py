import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.bike import Bike
from app.models.ride import Ride, TrailCondition
from app.models.setup import Setup
from app.schemas.ride import RideCreate, RideResponse, RideUpdate

router = APIRouter(prefix="/api/rides", tags=["rides"])


@router.get("/", response_model=list[RideResponse])
def list_rides(
    bike_id: uuid.UUID | None = None,
    trail_name: str | None = None,
    trail_condition: TrailCondition | None = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(Ride).options(joinedload(Ride.setup))

    if bike_id:
        query = query.filter(Ride.bike_id == bike_id)
    if trail_name:
        query = query.filter(Ride.trail_name.ilike(f"%{trail_name}%"))
    if trail_condition:
        query = query.filter(Ride.trail_condition == trail_condition)

    return query.order_by(Ride.date.desc()).offset(offset).limit(limit).all()


@router.get("/{ride_id}", response_model=RideResponse)
def get_ride(ride_id: uuid.UUID, db: Session = Depends(get_db)):
    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup))
        .filter(Ride.id == ride_id)
        .first()
    )
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride


@router.post("/", response_model=RideResponse, status_code=201)
def create_ride(data: RideCreate, db: Session = Depends(get_db)):
    # Verify bike exists
    bike = db.query(Bike).filter(Bike.id == data.bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")

    ride_data = data.model_dump(exclude={"setup"})
    ride = Ride(**ride_data)
    db.add(ride)
    db.flush()  # Get ride.id

    if data.setup:
        setup = Setup(**data.setup.model_dump(), ride_id=ride.id)
        db.add(setup)

    db.commit()
    db.refresh(ride)

    # Reload with setup
    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup))
        .filter(Ride.id == ride.id)
        .first()
    )
    return ride


@router.patch("/{ride_id}", response_model=RideResponse)
def update_ride(
    ride_id: uuid.UUID, data: RideUpdate, db: Session = Depends(get_db)
):
    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup))
        .filter(Ride.id == ride_id)
        .first()
    )
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    update_data = data.model_dump(exclude={"setup"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(ride, field, value)

    # Handle nested setup update
    if data.setup is not None:
        setup_data = data.setup.model_dump()
        if ride.setup:
            for field, value in setup_data.items():
                setattr(ride.setup, field, value)
        else:
            setup = Setup(**setup_data, ride_id=ride.id)
            db.add(setup)

    db.commit()
    db.refresh(ride)

    ride = (
        db.query(Ride)
        .options(joinedload(Ride.setup))
        .filter(Ride.id == ride.id)
        .first()
    )
    return ride


@router.delete("/{ride_id}", status_code=204)
def delete_ride(ride_id: uuid.UUID, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    db.delete(ride)
    db.commit()
