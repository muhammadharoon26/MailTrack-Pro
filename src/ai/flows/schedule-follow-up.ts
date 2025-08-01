'use server';

/**
 * @fileOverview A flow to automatically schedule a follow-up reminder email based on the email content and category.
 *
 * - scheduleFollowUp - A function that schedules a follow-up reminder.
 * - ScheduleFollowUpInput - The input type for the scheduleFollowUp function.
 * - ScheduleFollowUpOutput - The return type for the scheduleFollowUp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleFollowUpInputSchema = z.object({
  emailContent: z.string().describe('The content of the email.'),
  emailCategory: z
    .string()
    .describe(
      'The category of the email (e.g., internship application, job application, cold calling).'
    ),
  senderEmail: z.string().email().describe('The email address of the sender.'),
  recipientEmail: z.string().email().describe('The email address of the recipient.'),
  subject: z.string().describe('The subject of the email.'),
});
export type ScheduleFollowUpInput = z.infer<typeof ScheduleFollowUpInputSchema>;

const ScheduleFollowUpOutputSchema = z.object({
  followUpScheduled: z
    .boolean()
    .describe('Whether a follow-up reminder has been scheduled.'),
  followUpDate: z
    .string()
    .optional()
    .describe(
      'The date and time the follow-up reminder is scheduled for, in ISO format.'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason for scheduling or not scheduling a follow-up.'),
});
export type ScheduleFollowUpOutput = z.infer<typeof ScheduleFollowUpOutputSchema>;

export async function scheduleFollowUp(input: ScheduleFollowUpInput): Promise<ScheduleFollowUpOutput> {
  return scheduleFollowUpFlow(input);
}

const scheduleFollowUpPrompt = ai.definePrompt({
  name: 'scheduleFollowUpPrompt',
  input: {schema: ScheduleFollowUpInputSchema},
  output: {schema: ScheduleFollowUpOutputSchema},
  prompt: `You are an AI assistant that helps schedule follow-up reminders for emails.

  Based on the email content, determine if a follow-up is appropriate. If it is, schedule it for exactly 36 hours after the email was sent.

  Email Content: {{{emailContent}}}
  Email Category: {{{emailCategory}}}
  Sender Email: {{{senderEmail}}}
  Recipient Email: {{{recipientEmail}}}
  Subject: {{{subject}}}

  Consider all these factors and then use the output schema to return a structured response. If a follow-up is scheduled, set the followUpDate to be 36 hours from now.
  `,
});

const scheduleFollowUpFlow = ai.defineFlow(
  {
    name: 'scheduleFollowUpFlow',
    inputSchema: ScheduleFollowUpInputSchema,
    outputSchema: ScheduleFollowUpOutputSchema,
  },
  async (input: ScheduleFollowUpInput) => {
    const {output} = await scheduleFollowUpPrompt(input);
    
    // If the AI decided to schedule a follow-up, calculate the exact date.
    if (output?.followUpScheduled) {
      const followUpDate = new Date();
      followUpDate.setHours(followUpDate.getHours() + 36);
      output.followUpDate = followUpDate.toISOString();
    }
    
    return output!;
  }
);
