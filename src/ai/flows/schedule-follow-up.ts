'use server';

/**
 * @fileOverview A flow to automatically schedule a follow-up reminder email based on the email content and category.
 *
 * - scheduleFollowUp - A function that schedules a follow-up reminder.
 * - ScheduleFollowUpInput - The input type for the scheduleFollowUp function.
 * - ScheduleFollowUpOutput - The return type for the scheduleFollowUp function.
 */

import {ai, createAIWithKey} from '@/ai/genkit';
import {z} from 'genkit';
import {getAllApiKeys} from '@/ai/api-key-manager';

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

/**
 * Main function to schedule a follow-up with retry logic using rotating API keys
 */
export async function scheduleFollowUp(input: ScheduleFollowUpInput): Promise<ScheduleFollowUpOutput> {
  const apiKeys = getAllApiKeys();
  
  // If no API keys are configured, use fallback immediately
  if (apiKeys.length === 0) {
    console.warn('[Schedule Follow-up] No API keys configured. Using fallback scheduling.');
    return createFallbackResponse();
  }

  // Try each API key in sequence
  for (let i = 0; i < apiKeys.length; i++) {
    try {
      console.log(`[Schedule Follow-up] Attempting with API key ${i + 1}/${apiKeys.length}`);
      
      const aiInstance = createAIWithKey(apiKeys[i]);
      const result = await executeScheduleFlow(aiInstance, input);
      
      console.log('[Schedule Follow-up] Successfully scheduled using AI');
      return result;
      
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('429') || 
                          error?.message?.includes('quota') ||
                          error?.status === 429;
      
      console.error(`[Schedule Follow-up] Error with API key ${i + 1}:`, {
        isQuotaError,
        message: error?.message,
        status: error?.status,
      });

      // If it's a quota error and we have more keys to try, continue to next key
      if (isQuotaError && i < apiKeys.length - 1) {
        console.log(`[Schedule Follow-up] Quota exceeded. Trying next API key...`);
        continue;
      }
      
      // If it's the last key or a non-quota error, use fallback
      if (i === apiKeys.length - 1) {
        console.warn('[Schedule Follow-up] All API keys exhausted. Using fallback.');
        return createFallbackResponse();
      }
    }
  }
  
  // Fallback if all attempts failed
  return createFallbackResponse();
}

/**
 * Execute the AI flow with a specific AI instance
 */
async function executeScheduleFlow(
  aiInstance: ReturnType<typeof createAIWithKey>,
  input: ScheduleFollowUpInput
): Promise<ScheduleFollowUpOutput> {
  const scheduleFollowUpPrompt = aiInstance.definePrompt({
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

  const scheduleFollowUpFlow = aiInstance.defineFlow(
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

  return scheduleFollowUpFlow(input);
}

/**
 * Create a fallback response when AI is unavailable
 */
function createFallbackResponse(): ScheduleFollowUpOutput {
  const followUpDate = new Date();
  followUpDate.setHours(followUpDate.getHours() + 36);
  
  return {
    followUpScheduled: true,
    followUpDate: followUpDate.toISOString(),
    reason: 'AI service unavailable. Used default 36-hour follow-up schedule.',
  };
}
