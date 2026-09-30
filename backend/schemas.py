# Defines the request and response formats used by FleetFlow APIs.
from pydantic import BaseModel, ConfigDict


# ---------- Vehicle ----------

class VehicleCreate(BaseModel):
    registration_number: str
    make: str
    model: str
    year: int
    vehicle_type: str
    status: str = "Active"
    mileage: int = 0


class VehicleResponse(VehicleCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ---------- Driver ----------

class DriverCreate(BaseModel):
    name: str
    employee_id: str
    phone: str
    email: str
    license_number: str
    license_expiry: str
    status: str = "Active"
    assigned_vehicle_id: int | None = None


class DriverResponse(DriverCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ---------- Trip ----------

class TripCreate(BaseModel):
    vehicle_id: int
    driver_id: int
    origin: str
    destination: str
    start_date: str
    end_date: str | None = None
    status: str = "Planned"
    revenue: int = 0


class TripResponse(TripCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ---------- Maintenance ----------

class MaintenanceCreate(BaseModel):
    vehicle_id: int
    maintenance_type: str
    description: str | None = None
    service_date: str
    cost: int = 0
    odometer: int = 0
    status: str = "Completed"


class MaintenanceResponse(MaintenanceCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
    
# Defines the request and response formats for authentication.
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "User"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str