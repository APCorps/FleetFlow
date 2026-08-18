import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import {Maintenance} from '../types';

interface MaintenanceContextType {
  maintenanceRecords: Maintenance[];
  addMaintenance: (
    maintenance: Maintenance,
  ) => void;
  updateMaintenance: (
    maintenance: Maintenance,
  ) => void;
  deleteMaintenance: (
    maintenanceId: string,
  ) => void;
}

const MaintenanceContext = createContext<
  MaintenanceContextType | undefined
>(undefined);

interface MaintenanceProviderProps {
  children: ReactNode;
}

const initialMaintenance: Maintenance[] = [
  {
    id: 'maintenance-001',
    vehicleId: 'vehicle-001',
    title: 'Scheduled Service',
    description:
      'Routine engine and general vehicle service.',
    status: 'Scheduled',
    priority: 'Medium',
    scheduledDate: '2026-08-20',
    mileage: 45000,
    createdAt: '2026-08-10T09:00:00.000Z',
  },
  {
    id: 'maintenance-002',
    vehicleId: 'vehicle-002',
    title: 'Brake Inspection',
    description:
      'Inspect brake pads, discs and brake fluid.',
    status: 'In Progress',
    priority: 'High',
    scheduledDate: '2026-08-16',
    mileage: 62000,
    createdAt: '2026-08-11T10:00:00.000Z',
  },
  {
    id: 'maintenance-003',
    vehicleId: 'vehicle-003',
    title: 'Oil Change',
    description:
      'Engine oil and oil filter replacement.',
    status: 'Completed',
    priority: 'Low',
    scheduledDate: '2026-08-05',
    completedDate: '2026-08-05',
    mileage: 38000,
    cost: 4500,
    createdAt: '2026-08-05T08:30:00.000Z',
  },
];

export const MaintenanceProvider = ({
  children,
}: MaintenanceProviderProps) => {
  const [
    maintenanceRecords,
    setMaintenanceRecords,
  ] = useState<Maintenance[]>(initialMaintenance);

  const addMaintenance = (
    maintenance: Maintenance,
  ) => {
    setMaintenanceRecords(
      currentRecords => [
        ...currentRecords,
        maintenance,
      ],
    );
  };

  const updateMaintenance = (
    updatedMaintenance: Maintenance,
  ) => {
    setMaintenanceRecords(currentRecords =>
      currentRecords.map(record =>
        record.id === updatedMaintenance.id
          ? updatedMaintenance
          : record,
      ),
    );
  };

  const deleteMaintenance = (
    maintenanceId: string,
  ) => {
    setMaintenanceRecords(currentRecords =>
      currentRecords.filter(
        record => record.id !== maintenanceId,
      ),
    );
  };

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceRecords,
        addMaintenance,
        updateMaintenance,
        deleteMaintenance,
      }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance =
  (): MaintenanceContextType => {
    const context =
      useContext(MaintenanceContext);

    if (!context) {
      throw new Error(
        'useMaintenance must be used inside a MaintenanceProvider',
      );
    }

    return context;
  };