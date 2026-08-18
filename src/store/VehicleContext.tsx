import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import {Vehicle} from '../types';

interface VehicleContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;
}

const VehicleContext = createContext<
  VehicleContextType | undefined
>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

const initialVehicles: Vehicle[] = [
  {
    id: 'vehicle-001',
    registrationNumber: 'FL-024',
    make: 'Tata',
    model: 'Prima',
    year: 2024,
    type: 'Truck',
    status: 'Active',
    mileage: 45230,
    createdAt: '2026-08-13T10:30:00.000Z',
  },
  {
    id: 'vehicle-002',
    registrationNumber: 'FL-011',
    make: 'Mahindra',
    model: 'Bolero',
    year: 2023,
    type: 'Van',
    status: 'Maintenance',
    mileage: 68120,
    createdAt: '2026-08-12T09:15:00.000Z',
  },
  {
    id: 'vehicle-003',
    registrationNumber: 'FL-008',
    make: 'Maruti',
    model: 'Ertiga',
    year: 2025,
    type: 'Car',
    status: 'Active',
    mileage: 18450,
    createdAt: '2026-08-10T14:20:00.000Z',
  },
];

export const VehicleProvider = ({
  children,
}: VehicleProviderProps) => {
  const [vehicles, setVehicles] =
    useState<Vehicle[]>(initialVehicles);

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles(currentVehicles => [
      ...currentVehicles,
      vehicle,
    ]);
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(currentVehicles =>
      currentVehicles.map(vehicle =>
        vehicle.id === updatedVehicle.id
          ? updatedVehicle
          : vehicle,
      ),
    );
  };

  const deleteVehicle = (vehicleId: string) => {
    setVehicles(currentVehicles =>
      currentVehicles.filter(
        vehicle => vehicle.id !== vehicleId,
      ),
    );
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
      }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = (): VehicleContextType => {
  const context = useContext(VehicleContext);

  if (!context) {
    throw new Error(
      'useVehicles must be used inside a VehicleProvider',
    );
  }

  return context;
};