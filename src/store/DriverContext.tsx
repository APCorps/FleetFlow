import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import {Driver} from '../types';

interface DriverContextType {
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (driverId: string) => void;
}

const DriverContext = createContext<
  DriverContextType | undefined
>(undefined);

interface DriverProviderProps {
  children: ReactNode;
}

const initialDrivers: Driver[] = [
  {
    id: 'driver-001',
    name: 'Arjun Mehta',
    employeeId: 'DRV-001',
    phone: '+91 98765 43210',
    email: 'arjun.mehta@fleetflow.com',
    licenseNumber: 'DL-042024001',
    licenseExpiry: '2027-08-15',
    status: 'Active',
    assignedVehicleId: 'vehicle-001',
    createdAt: '2026-08-10T09:30:00.000Z',
  },
  {
    id: 'driver-002',
    name: 'Rahul Sharma',
    employeeId: 'DRV-002',
    phone: '+91 98765 43211',
    email: 'rahul.sharma@fleetflow.com',
    licenseNumber: 'DL-042024002',
    licenseExpiry: '2026-12-20',
    status: 'Active',
    assignedVehicleId: 'vehicle-002',
    createdAt: '2026-08-11T10:15:00.000Z',
  },
  {
    id: 'driver-003',
    name: 'Vikram Singh',
    employeeId: 'DRV-003',
    phone: '+91 98765 43212',
    email: 'vikram.singh@fleetflow.com',
    licenseNumber: 'DL-042024003',
    licenseExpiry: '2028-03-10',
    status: 'On Leave',
    createdAt: '2026-08-12T11:00:00.000Z',
  },
];

export const DriverProvider = ({
  children,
}: DriverProviderProps) => {
  const [drivers, setDrivers] =
    useState<Driver[]>(initialDrivers);

  const addDriver = (driver: Driver) => {
    setDrivers(currentDrivers => [
      ...currentDrivers,
      driver,
    ]);
  };

  const updateDriver = (updatedDriver: Driver) => {
    setDrivers(currentDrivers =>
      currentDrivers.map(driver =>
        driver.id === updatedDriver.id
          ? updatedDriver
          : driver,
      ),
    );
  };

  const deleteDriver = (driverId: string) => {
    setDrivers(currentDrivers =>
      currentDrivers.filter(
        driver => driver.id !== driverId,
      ),
    );
  };

  return (
    <DriverContext.Provider
      value={{
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
      }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDrivers = (): DriverContextType => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new Error(
      'useDrivers must be used inside a DriverProvider',
    );
  }

  return context;
};