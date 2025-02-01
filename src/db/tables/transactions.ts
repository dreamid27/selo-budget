import { db } from '../db';
import type { Transaction } from '@/types/transaction';

export const transactionsTable = {
  getAll: () => db.transactions.toArray(),

  add: async (transaction: Omit<Transaction, 'id'>) => {
    const id = await db.transactions.add(transaction);
    return id;
  },
};
