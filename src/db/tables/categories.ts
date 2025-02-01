import { db } from '../db';
import type { Category } from '../interfaces';

export const categoriesTable = {
  getAll: () => db.categories.toArray(),

  add: async (category: Omit<Category, 'id'>) => {
    const id = await db.categories.add(category);
    return id;
  },

  bulkAdd: (categories: Omit<Category, 'id'>[]) => {
    return db.categories.bulkAdd(categories);
  },
};
