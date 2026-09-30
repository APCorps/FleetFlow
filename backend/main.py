# Main FastAPI application that registers our API modules.
from fastapi import FastAPI
# Registers all FleetFlow API modules.
from routers import vehicles, drivers, trips, maintenance

app = FastAPI(title="FleetFlow API")

app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)

@app.get("/")
def root():
    return {"message": "FleetFlow Backend is running"}

# Registers the authentication API with the FleetFlow application.
from fastapi import FastAPI
from routers import (
    vehicles,
    drivers,
    trips,
    maintenance,
    auth
)

app = FastAPI(title="FleetFlow API")

app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "FleetFlow Backend is running"}