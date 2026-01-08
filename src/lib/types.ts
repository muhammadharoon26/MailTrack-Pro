export interface Email {
  id: string; // Will now be the database primary key
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  category: 'internship' | 'job' | 'cold-outreach' | 'Promogen Lead';
  attachments: { name: string; size: number }[];
  sentAt: string | Date; // Can be string or Date from DB
  followUpAt?: string | Date; // Can be string or Date from DB
}
