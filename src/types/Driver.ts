export type DriverStatus =
  | 'Active'
  | 'Inactive'
  | 'On Leave';

export interface Driver {
  id: string;
  name: string;
  employeeId: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  assignedVehicleId?: string;
  createdAt: string;
}