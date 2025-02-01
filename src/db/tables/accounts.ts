import { db } from '../db';
import type { Account } from '../interfaces';

export const accountsTable = {
  getAll: () => db.accounts.toArray(),

  add: async (account: Omit<Account, 'id'>) => {
    const id = await db.accounts.add(account);
    return id;
  },

  update: async (id: number, balance: number) => {
    await db.accounts.update(id, { balance });
  },

  getCount: () => db.accounts.count(),
};
