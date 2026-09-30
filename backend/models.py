# Defines FleetFlow database tables and their relationships.
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer)
    vehicle_type = Column(String)
    status = Column(String, default="Active")
    mileage = Column(Integer, default=0)

    drivers = relationship("Driver", back_populates="vehicle")
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_records = relationship(
        "Maintenance",
        back_populates="vehicle"
    )


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    employee_id = Column(String, unique=True, nullable=False)
    phone = Column(String)
    email = Column(String)
    license_number = Column(String, unique=True, nullable=False)
    license_expiry = Column(String)
    status = Column(String, default="Active")

    assigned_vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=True
    )

    vehicle = relationship("Vehicle", back_populates="drivers")
    trips = relationship("Trip", back_populates="driver")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False
    )

    driver_id = Column(
        Integer,
        ForeignKey("drivers.id"),
        nullable=False
    )

    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    start_date = Column(String)
    end_date = Column(String)
    status = Column(String, default="Planned")
    revenue = Column(Integer, default=0)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False
    )

    maintenance_type = Column(String, nullable=False)
    description = Column(String)
    service_date = Column(String, nullable=False)
    cost = Column(Integer, default=0)
    odometer = Column(Integer, default=0)
    status = Column(String, default="Completed")

    vehicle = relationship(
        "Vehicle",
        back_populates="maintenance_records"
    )

# Defines the User table used for FleetFlow authentication.
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="User")