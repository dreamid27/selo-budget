import Dexie, { Table } from 'dexie';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { Settings } from '@/types/settings';
import { Budget, Goal } from '@/types/budget';
import { accountsTable } from './tables/accounts';
import { categoriesTable } from './tables/categories';
import { settingsTable } from './tables/settings';
import { transactionsTable } from './tables/transactions';
import { BudgetLimit } from './interfaces';

export class BudgetDB extends Dexie {
  accounts!: Table<Account>;
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  settings!: Table<Settings>;
  budgets!: Table<Budget>;
  goals!: Table<Goal>;
  budgetLimits!: Table<BudgetLimit>;

  constructor() {
    super('budget-db');
    this.version(1).stores({
      accounts: '++id, name, type, balance',
      categories: '++id, name, type, icon, color',
      transactions:
        '++id, date, amount, type, category, categoryName, accountId',
      settings: '++id, name, currency, theme',
      budgets: '++id, name, amount, categoryId, period',
      goals: '++id, name, targetAmount, currentAmount, category, priority',
      budgetLimits: '++id, categoryId, period',
    });
  }
}

export const db = new BudgetDB();

// Export table operations
export const { getAll: getTransactions, add: addTransaction } =
  transactionsTable;
export const {
  getAll: getAccounts,
  add: addAccount,
  update: updateAccount,
} = accountsTable;
export const { getAll: getCategories } = categoriesTable;
export const { get: getUserSettings } = settingsTable;

export const initializeDefaultData = async () => {
  // Check if we already have data
  const settingsCount = await settingsTable.getCount();
  if (settingsCount > 0) return;

  // Add default settings
  await settingsTable.add({
    name: 'User',
    currency: 'USD',
    theme: 'light',
    budgetAlerts: true,
    overBudgetThreshold: 0.8,
  });

  // Add default categories
  const defaultCategories = [
    { name: 'Salary', type: 'income' as const },
    { name: 'Food', type: 'expense' as const },
    { name: 'Transportation', type: 'expense' as const },
    { name: 'Shopping', type: 'expense' as const },
    { name: 'Bills', type: 'expense' as const },
  ];

  await categoriesTable.bulkAdd(defaultCategories);

  // Add default account
  await accountsTable.add({
    name: 'Main Account',
    type: 'checking',
    balance: 0,
    currency: 'USD',
  });
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const accountsCount = await accountsTable.getCount();
    return accountsCount > 0;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};
