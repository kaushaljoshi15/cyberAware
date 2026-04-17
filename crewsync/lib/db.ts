import { Pool } from 'pg';

const pool = new Pool({
  // Provide a safe mock fallback so the application doesn't crash on startup if the env file is missing
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crewsync',
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};