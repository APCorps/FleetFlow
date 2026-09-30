# Main FastAPI application that registers all FleetFlow API modules.

from fastapi import FastAPI

from database import Base, engine
from routers import (
    vehicles,
    drivers,
    trips,
    maintenance,
    auth,
)

# Creates all SQLAlchemy tables if they do not already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FleetFlow API")

app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "FleetFlow Backend is running"}