export type AccountTransactionType =
  | 'Income'
  | 'Expense';

export type AccountTransactionCategory =
  | 'Trip Revenue'
  | 'Fuel'
  | 'Maintenance'
  | 'Driver Cost'
  | 'Insurance'
  | 'Other';

export interface AccountTransaction {
  id: string;

  type: AccountTransactionType;

  category: AccountTransactionCategory;

  amount: number;

  description: string;

  date: string;

  vehicleId?: string;

  tripId?: string;

  driverId?: string;

  maintenanceId?: string;

  createdAt: string;
}