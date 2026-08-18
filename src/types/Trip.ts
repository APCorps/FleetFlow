export type TripStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;

  origin: string;
  destination: string;

  scheduledDate: string;

  status: TripStatus;

  startTime?: string;
  endTime?: string;

  distance?: number;

  notes?: string;

  createdAt: string;
}