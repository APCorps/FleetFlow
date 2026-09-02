import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import {AccountTransaction} from '../types';

interface AccountsContextType {
  transactions: AccountTransaction[];

  totalIncome: number;

  totalExpenses: number;

  netProfitLoss: number;

  addTransaction: (
    transaction: AccountTransaction,
  ) => void;

  updateTransaction: (
    transaction: AccountTransaction,
  ) => void;

  deleteTransaction: (
    transactionId: string,
  ) => void;
}

const AccountsContext = createContext<
  AccountsContextType | undefined
>(undefined);

interface AccountsProviderProps {
  children: ReactNode;
}

/*
 * ─────────────────────────────────────
 * INITIAL ACCOUNT DATA
 * ─────────────────────────────────────
 *
 * These are sample records for development.
 * They can be replaced through the Accounts
 * screen once we build the full module.
 */

const initialTransactions: AccountTransaction[] = [
  {
    id: 'account-001',

    type: 'Income',

    category: 'Trip Revenue',

    amount: 25000,

    description: 'Freight delivery revenue',

    date: '2026-08-18',

    vehicleId: 'vehicle-001',

    tripId: 'trip-001',

    createdAt:
      '2026-08-18T10:00:00.000Z',
  },

  {
    id: 'account-002',

    type: 'Expense',

    category: 'Maintenance',

    amount: 4500,

    description: 'Vehicle maintenance cost',

    vehicleId: 'vehicle-003',

    maintenanceId: 'maintenance-003',

    date: '2026-08-05',

    createdAt:
      '2026-08-05T14:00:00.000Z',
  },

  {
    id: 'account-003',

    type: 'Expense',

    category: 'Fuel',

    amount: 3200,

    description: 'Fleet fuel expense',

    vehicleId: 'vehicle-001',

    date: '2026-08-17',

    createdAt:
      '2026-08-17T09:30:00.000Z',
  },
];

export const AccountsProvider = ({
  children,
}: AccountsProviderProps) => {
  const [transactions, setTransactions] =
    useState<AccountTransaction[]>(
      initialTransactions,
    );

  /*
   * ─────────────────────────────────────
   * TOTAL INCOME
   * ─────────────────────────────────────
   */

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          transaction =>
            transaction.type === 'Income',
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0,
        ),
    [transactions],
  );

  /*
   * ─────────────────────────────────────
   * TOTAL EXPENSES
   * ─────────────────────────────────────
   */

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter(
          transaction =>
            transaction.type === 'Expense',
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0,
        ),
    [transactions],
  );

  /*
   * ─────────────────────────────────────
   * NET PROFIT / LOSS
   * ─────────────────────────────────────
   *
   * Positive value = Profit
   * Negative value = Loss
   */

  const netProfitLoss =
    totalIncome - totalExpenses;

  /*
   * ─────────────────────────────────────
   * ADD TRANSACTION
   * ─────────────────────────────────────
   */

  const addTransaction = (
    transaction: AccountTransaction,
  ) => {
    setTransactions(
      currentTransactions => [
        ...currentTransactions,
        transaction,
      ],
    );
  };

  /*
   * ─────────────────────────────────────
   * UPDATE TRANSACTION
   * ─────────────────────────────────────
   */

  const updateTransaction = (
    updatedTransaction: AccountTransaction,
  ) => {
    setTransactions(
      currentTransactions =>
        currentTransactions.map(
          transaction =>
            transaction.id ===
            updatedTransaction.id
              ? updatedTransaction
              : transaction,
        ),
    );
  };

  /*
   * ─────────────────────────────────────
   * DELETE TRANSACTION
   * ─────────────────────────────────────
   */

  const deleteTransaction = (
    transactionId: string,
  ) => {
    setTransactions(
      currentTransactions =>
        currentTransactions.filter(
          transaction =>
            transaction.id !==
            transactionId,
        ),
    );
  };

  return (
    <AccountsContext.Provider
      value={{
        transactions,

        totalIncome,

        totalExpenses,

        netProfitLoss,

        addTransaction,

        updateTransaction,

        deleteTransaction,
      }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts =
  (): AccountsContextType => {
    const context =
      useContext(AccountsContext);

    if (!context) {
      throw new Error(
        'useAccounts must be used inside an AccountsProvider',
      );
    }

    return context;
  };