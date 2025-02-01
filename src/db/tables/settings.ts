import { db } from '../db';
import type { UserSettings } from '../interfaces';

export const settingsTable = {
  get: async () => {
    const settings = await db.settings.toArray();
    return settings[0] || null;
  },

  add: (settings: Omit<UserSettings, 'id'>) => {
    return db.settings.add(settings);
  },

  getCount: () => db.settings.count(),
};
