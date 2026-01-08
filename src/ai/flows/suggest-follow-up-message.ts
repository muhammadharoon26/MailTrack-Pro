'use server';
/**
 * @fileOverview This file contains the Genkit flow for suggesting a follow-up email message.
 *
 * - suggestFollowUpMessage - A function that takes an original email and suggests a follow-up message.
 * - SuggestFollowUpMessageInput - The input type for the suggestFollowUpMessage function.
 * - SuggestFollowUpMessageOutput - The output type for the suggestFollowUpMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFollowUpMessageInputSchema = z.object({
  originalEmail: z.string().describe('The content of the original email sent.'),
  emailCategory: z.string().describe('The category of the email (e.g., internship, job, cold-outreach, Promogen Lead).'),
});
export type SuggestFollowUpMessageInput = z.infer<typeof SuggestFollowUpMessageInputSchema>;

const SuggestFollowUpMessageOutputSchema = z.object({
  followUpSuggestion: z.string().describe('The AI-suggested follow-up email message.'),
});
export type SuggestFollowUpMessageOutput = z.infer<typeof SuggestFollowUpMessageOutputSchema>;

export async function suggestFollowUpMessage(input: SuggestFollowUpMessageInput): Promise<SuggestFollowUpMessageOutput> {
  return suggestFollowUpMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFollowUpMessagePrompt',
  input: {schema: SuggestFollowUpMessageInputSchema},
  output: {schema: SuggestFollowUpMessageOutputSchema},
  prompt: `You are an AI assistant that helps users draft follow-up emails.
  Given the original email and its category, suggest a brief, polite, and professional follow-up email message.
  The follow-up email should remind the recipient of the original email and reiterate the key points or request.
  The tone of the follow-up should be tailored to the email category.

  Original Email:
  {{{originalEmail}}}

  Email Category:
  {{{emailCategory}}}

  Follow-up Email Suggestion:`,
});

const suggestFollowUpMessageFlow = ai.defineFlow(
  {
    name: 'suggestFollowUpMessageFlow',
    inputSchema: SuggestFollowUpMessageInputSchema,
    outputSchema: SuggestFollowUpMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
