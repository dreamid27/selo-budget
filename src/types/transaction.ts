export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id?: number;
  type: 'expense' | 'income';
  amount: number;
  category: number;
  categoryName: string;
  accountId: number;
  description: string;
  note?: string;
  date: Date;
}
