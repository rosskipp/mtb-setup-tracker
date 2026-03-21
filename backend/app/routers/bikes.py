from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bike
from app.schemas import BikeCreate, BikeRead, BikeUpdate

router = APIRouter(prefix="/api/bikes", tags=["bikes"])


@router.get("", response_model=list[BikeRead])
def list_bikes(db: Session = Depends(get_db)):
    return db.query(Bike).order_by(Bike.name).all()


@router.get("/{bike_id}", response_model=BikeRead)
def get_bike(bike_id: int, db: Session = Depends(get_db)):
    bike = db.get(Bike, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    return bike


@router.post("", response_model=BikeRead, status_code=201)
def create_bike(data: BikeCreate, db: Session = Depends(get_db)):
    bike = Bike(**data.model_dump())
    db.add(bike)
    db.commit()
    db.refresh(bike)
    return bike


@router.put("/{bike_id}", response_model=BikeRead)
def update_bike(bike_id: int, data: BikeUpdate, db: Session = Depends(get_db)):
    bike = db.get(Bike, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(bike, key, value)
    db.commit()
    db.refresh(bike)
    return bike


@router.delete("/{bike_id}", status_code=204)
def delete_bike(bike_id: int, db: Session = Depends(get_db)):
    bike = db.get(Bike, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    db.delete(bike)
    db.commit()
