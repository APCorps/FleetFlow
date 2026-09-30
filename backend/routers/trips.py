# Handles Trip API operations and returns a clean error when invalid vehicle/driver IDs are used.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import Trip
from schemas import TripCreate, TripResponse
from auth import get_current_user

router = APIRouter(
    prefix="/trips",
    tags=["Trips"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):

    new_trip = Trip(**trip.model_dump())

    try:
        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)

        return new_trip

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Invalid vehicle_id or driver_id. Vehicle and driver must exist."
        )


@router.get("/", response_model=list[TripResponse])
def get_trips(db: Session = Depends(get_db),  current_user: str = Depends(get_current_user)):
    return db.query(Trip).all()


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_data: TripCreate,
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
):

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    trip.vehicle_id = trip_data.vehicle_id
    trip.driver_id = trip_data.driver_id
    trip.origin = trip_data.origin
    trip.destination = trip_data.destination
    trip.start_date = trip_data.start_date
    trip.end_date = trip_data.end_date
    trip.status = trip_data.status
    trip.revenue = trip_data.revenue

    try:
        db.commit()
        db.refresh(trip)

        return trip

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Invalid vehicle_id or driver_id. Vehicle and driver must exist."
        )


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    db.delete(trip)
    db.commit()

    return {"message": "Trip deleted successfully"}