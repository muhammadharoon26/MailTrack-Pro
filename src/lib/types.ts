export interface Email {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  category: 'internship' | 'job' | 'cold-outreach';
  attachments: { name: string; size: number }[];
  sentAt: string; // ISO string
  followUpAt?: string; // ISO string
}
