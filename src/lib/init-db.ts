import { initializeDefaultData } from '../db/db';

export async function initializeDatabase() {
  try {
    await initializeDefaultData();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Call this function when your app starts
export function setupDatabase() {
  // Initialize the database immediately
  initializeDatabase().catch((error) => {
    console.error('Failed to initialize database:', error);
  });
}
