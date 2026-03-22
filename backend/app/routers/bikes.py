import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bike import Bike
from app.schemas.bike import BikeCreate, BikeResponse, BikeUpdate

router = APIRouter(prefix="/api/bikes", tags=["bikes"])


@router.get("/", response_model=list[BikeResponse])
def list_bikes(db: Session = Depends(get_db)):
    return db.query(Bike).order_by(Bike.name).all()


@router.get("/{bike_id}", response_model=BikeResponse)
def get_bike(bike_id: uuid.UUID, db: Session = Depends(get_db)):
    bike = db.query(Bike).filter(Bike.id == bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    return bike


@router.post("/", response_model=BikeResponse, status_code=201)
def create_bike(data: BikeCreate, db: Session = Depends(get_db)):
    bike = Bike(**data.model_dump())
    db.add(bike)
    db.commit()
    db.refresh(bike)
    return bike


@router.patch("/{bike_id}", response_model=BikeResponse)
def update_bike(
    bike_id: uuid.UUID, data: BikeUpdate, db: Session = Depends(get_db)
):
    bike = db.query(Bike).filter(Bike.id == bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bike, field, value)

    db.commit()
    db.refresh(bike)
    return bike


@router.delete("/{bike_id}", status_code=204)
def delete_bike(bike_id: uuid.UUID, db: Session = Depends(get_db)):
    bike = db.query(Bike).filter(Bike.id == bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    db.delete(bike)
    db.commit()
