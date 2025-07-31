import 'dotenv/config';
import { db as vercelDb } from '@vercel/postgres';

export const db = {
  query: async (query: string, params?: any[]) => {
    return vercelDb.query(query, params);
  },
};
