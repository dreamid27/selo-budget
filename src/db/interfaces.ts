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
