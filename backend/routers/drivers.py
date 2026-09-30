# Contains all Driver-related API endpoints.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Imports the JWT authentication dependency for protected Driver endpoints.
from auth import get_current_user

from database import SessionLocal
from models import Driver
from schemas import DriverCreate, DriverResponse

router = APIRouter(
    prefix="/drivers",
    tags=["Drivers"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=DriverResponse)
def create_driver(driver: DriverCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    new_driver = Driver(**driver.model_dump())

    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)

    return new_driver


@router.get("/", response_model=list[DriverResponse])
def get_drivers(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(Driver).all()

# Returns one driver using the driver's database ID.
@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        return {"message": "Driver not found"}

    return driver
   
# Updates an existing driver in PostgreSQL.
@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int,
    driver_data: DriverCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        return {"message": "Driver not found"}

    driver.name = driver_data.name
    driver.employee_id = driver_data.employee_id
    driver.phone = driver_data.phone
    driver.email = driver_data.email
    driver.license_number = driver_data.license_number
    driver.license_expiry = driver_data.license_expiry
    driver.status = driver_data.status
    driver.assigned_vehicle_id = driver_data.assigned_vehicle_id

    db.commit()
    db.refresh(driver)

    return driver

# Deletes a driver from PostgreSQL using the driver's ID.
@router.delete("/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        return {"message": "Driver not found"}

    db.delete(driver)
    db.commit()

    return {"message": "Driver deleted successfully"}