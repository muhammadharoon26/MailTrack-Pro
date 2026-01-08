import 'dotenv/config';
import { Pool } from 'pg';

// This checks if the POSTGRES_URL is available and throws an error if not.
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not set in the environment variables');
}

// Create a new Pool instance with the connection string.
// Vercel's environment variables will be used automatically.
const globalForDb = global as unknown as { db: Pool };

export const db =
  globalForDb.db ||
  new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
