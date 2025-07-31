import 'dotenv/config';
import { db as vercelDb } from '@vercel/postgres';
import { sql } from '@vercel/postgres';

export const db = {
  query: async (query: string, params?: any[]) => {
    return vercelDb.query(query, params);
  },
};

export async function createTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        "to" VARCHAR(255) NOT NULL,
        cc VARCHAR(255),
        bcc VARCHAR(255),
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        attachments JSONB,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        follow_up_at TIMESTAMP WITH TIME ZONE
      );
    `;
    console.log("Table 'emails' checked/created successfully.");
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}
