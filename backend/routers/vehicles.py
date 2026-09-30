# Defines the Vehicle API endpoints with structured response models.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import Vehicle
from schemas import VehicleCreate, VehicleResponse

# Imports JWT authentication dependency for protected Vehicle endpoints.
from auth import get_current_user

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=VehicleResponse)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    new_vehicle = Vehicle(**vehicle.model_dump())

    try:
        db.add(new_vehicle)
        db.commit()
        db.refresh(new_vehicle)

        return new_vehicle

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Registration number already exists."
        )


@router.get("/", response_model=list[VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    return db.query(Vehicle).all()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    vehicle.registration_number = vehicle_data.registration_number
    vehicle.make = vehicle_data.make
    vehicle.model = vehicle_data.model
    vehicle.year = vehicle_data.year
    vehicle.vehicle_type = vehicle_data.vehicle_type
    vehicle.status = vehicle_data.status
    vehicle.mileage = vehicle_data.mileage

    try:
        db.commit()
        db.refresh(vehicle)

        return vehicle

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Registration number already exists."
        )


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    db.delete(vehicle)
    db.commit()

    return {"message": "Vehicle deleted successfully"}