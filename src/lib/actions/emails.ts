'use server';

import { db } from '@/lib/db';
import type { Email } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const createEmailsTableQuery = `
  CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    "to" TEXT NOT NULL,
    cc TEXT,
    bcc TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    attachments JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    follow_up_at TIMESTAMP WITH TIME ZONE,
    user_email VARCHAR(255) NOT NULL
  );
`;

export async function getEmails(user_email: string): Promise<Email[]> {
  try {
    // Ensure the table exists before trying to query it.
    await db.query(createEmailsTableQuery);
    
    // Now, query for the emails.
    const { rows } = await db.query(
      'SELECT id, "to", cc, bcc, subject, body, category, attachments, sent_at as "sentAt", follow_up_at as "followUpAt" FROM emails WHERE user_email = $1 ORDER BY sent_at DESC',
      [user_email]
    );
    
    // If no rows are returned, it's not an error, just an empty list.
    // Return an empty array to prevent downstream errors.
    return rows || [];
  } catch (error) {
    console.error('Error fetching emails:', error);
    // This will now provide a more detailed error in the logs if the connection fails.
    throw new Error('Could not fetch emails.');
  }
}

export async function addEmail(email: Omit<Email, 'id' | 'sentAt'> & { user_email: string }): Promise<void> {
  const { to, cc, bcc, subject, body, category, attachments, followUpAt, user_email } = email;
  try {
    await db.query(createEmailsTableQuery);
    await db.query(
      `INSERT INTO emails ("to", cc, bcc, subject, body, category, attachments, sent_at, follow_up_at, user_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)`,
      [to, cc || null, bcc || null, subject, body, category, JSON.stringify(attachments), followUpAt || null, user_email]
    );
    revalidatePath('/');
    revalidatePath('/follow-up');
  } catch (error) {
    console.error('Error adding email:', error);
    throw new Error('Could not add email.');
  }
}
