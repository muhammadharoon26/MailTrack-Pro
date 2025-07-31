'use server';

import { db, createTables } from '@/lib/db';
import type { Email } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Initialize tables on first action
(async () => {
  await createTables();
})();

export async function getEmails(): Promise<Email[]> {
  try {
    const { rows } = await db.query('SELECT id, "to", cc, bcc, subject, body, category, attachments, sent_at as "sentAt", follow_up_at as "followUpAt" FROM emails ORDER BY sent_at DESC');
    return rows as Email[];
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw new Error('Could not fetch emails.');
  }
}

export async function addEmail(email: Omit<Email, 'id' | 'sentAt'>): Promise<void> {
  const { to, cc, bcc, subject, body, category, attachments, followUpAt } = email;
  try {
    await db.query(
      `INSERT INTO emails ("to", cc, bcc, subject, body, category, attachments, sent_at, follow_up_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
      [to, cc || null, bcc || null, subject, body, category, JSON.stringify(attachments), followUpAt || null]
    );
    revalidatePath('/');
    revalidatePath('/follow-up');
  } catch (error) {
    console.error('Error adding email:', error);
    throw new Error('Could not add email.');
  }
}
