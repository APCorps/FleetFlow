import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import {Trip} from '../types';

interface TripContextType {
  trips: Trip[];

  addTrip: (trip: Trip) => void;

  updateTrip: (trip: Trip) => void;

  deleteTrip: (tripId: string) => void;
}

const TripContext =
  createContext<TripContextType | undefined>(
    undefined,
  );

interface TripProviderProps {
  children: ReactNode;
}

const initialTrips: Trip[] = [
  {
    id: 'trip-001',
    vehicleId: 'vehicle-001',
    driverId: 'driver-001',
    origin: 'Mumbai',
    destination: 'Pune',
    scheduledDate: '2026-08-18',
    status: 'Scheduled',
    distance: 150,
    notes: 'Regular delivery trip.',
    createdAt: '2026-08-10T09:00:00.000Z',
  },

  {
    id: 'trip-002',
    vehicleId: 'vehicle-002',
    driverId: 'driver-002',
    origin: 'Delhi',
    destination: 'Jaipur',
    scheduledDate: '2026-08-16',
    status: 'In Progress',
    startTime: '2026-08-16T07:30:00.000Z',
    distance: 280,
    notes: 'Scheduled freight delivery.',
    createdAt: '2026-08-11T10:00:00.000Z',
  },

  {
    id: 'trip-003',
    vehicleId: 'vehicle-003',
    driverId: 'driver-003',
    origin: 'Bangalore',
    destination: 'Mysore',
    scheduledDate: '2026-08-12',
    status: 'Completed',
    startTime: '2026-08-12T06:30:00.000Z',
    endTime: '2026-08-12T12:30:00.000Z',
    distance: 145,
    notes: 'Completed successfully.',
    createdAt: '2026-08-05T08:30:00.000Z',
  },
];

export const TripProvider = ({
  children,
}: TripProviderProps) => {
  const [trips, setTrips] =
    useState<Trip[]>(initialTrips);

  const addTrip = (trip: Trip) => {
    setTrips(currentTrips => [
      ...currentTrips,
      trip,
    ]);
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(currentTrips =>
      currentTrips.map(trip =>
        trip.id === updatedTrip.id
          ? updatedTrip
          : trip,
      ),
    );
  };

  const deleteTrip = (tripId: string) => {
    setTrips(currentTrips =>
      currentTrips.filter(
        trip => trip.id !== tripId,
      ),
    );
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        addTrip,
        updateTrip,
        deleteTrip,
      }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = (): TripContextType => {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error(
      'useTrips must be used inside a TripProvider',
    );
  }

  return context;
};