export interface Account {
  id?: number;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  currency: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
}

export interface UserSettings {
  id?: number;
  name: string;
  currency: string;
  theme: 'light' | 'dark';
  budgetAlerts: boolean;
  overBudgetThreshold: number;
}

export interface Transaction {
  id?: number;
  type: 'expense' | 'income';
  amount: number;
  category: number;
  categoryName: string;
  description: string;
  date: Date;
  accountId: number;
  note?: string;
}

export interface BudgetLimit {
  id?: number;
  categoryId: number;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
}

export interface BudgetProgress {
  categoryId: number;
  spent: number;
  limit: number;
  percentage: number;
  period: 'monthly' | 'yearly';
}
