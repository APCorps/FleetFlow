# Handles Maintenance API operations and validates vehicle references.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import Maintenance
from schemas import MaintenanceCreate, MaintenanceResponse
from auth import get_current_user

router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=MaintenanceResponse)
def create_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
):
    new_maintenance = Maintenance(**maintenance.model_dump())

    try:
        db.add(new_maintenance)
        db.commit()
        db.refresh(new_maintenance)

        return new_maintenance

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Invalid vehicle_id. Vehicle must exist."
        )


# Returns maintenance records only for authenticated users.
@router.get("/", response_model=list[MaintenanceResponse])
def get_maintenance(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    return db.query(Maintenance).all()


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def get_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
):
    maintenance = (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    return maintenance


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance(
    maintenance_id: int,
    maintenance_data: MaintenanceCreate,
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
):
    maintenance = (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    maintenance.vehicle_id = maintenance_data.vehicle_id
    maintenance.maintenance_type = maintenance_data.maintenance_type
    maintenance.description = maintenance_data.description
    maintenance.service_date = maintenance_data.service_date
    maintenance.cost = maintenance_data.cost
    maintenance.odometer = maintenance_data.odometer
    maintenance.status = maintenance_data.status

    try:
        db.commit()
        db.refresh(maintenance)

        return maintenance

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Invalid vehicle_id. Vehicle must exist."
        )


@router.delete("/{maintenance_id}")
def delete_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db), current_user: str = Depends(get_current_user)
):
    maintenance = (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )

    if not maintenance:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    db.delete(maintenance)
    db.commit()

    return {"message": "Maintenance record deleted successfully"}