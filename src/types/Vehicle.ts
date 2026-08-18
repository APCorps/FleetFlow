export type VehicleType =
  | 'Truck'
  | 'Van'
  | 'Car'
  | 'Motorcycle'
  | 'Other';

export type VehicleStatus =
  | 'Active'
  | 'Maintenance'
  | 'Inactive';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  mileage: number;
  createdAt: string;
}