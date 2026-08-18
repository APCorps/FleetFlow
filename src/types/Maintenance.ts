export type MaintenanceStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed';

export type MaintenancePriority =
  | 'Low'
  | 'Medium'
  | 'High';

export interface Maintenance {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduledDate: string;
  completedDate?: string;
  mileage?: number;
  cost?: number;
  createdAt: string;
}