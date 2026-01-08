import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {getNextApiKey} from './api-key-manager';

/**
 * Create a Genkit AI instance with a specific API key
 * @param apiKey - The Gemini API key to use
 * @returns Configured Genkit instance
 */
export function createAIWithKey(apiKey: string) {
  return genkit({
    plugins: [googleAI({apiKey})],
    model: 'googleai/gemini-3-flash-preview',
  });
}

/**
 * Default AI instance using the first available API key
 */
const primaryKey = getNextApiKey();

if (!primaryKey) {
  console.warn('[Genkit] No API keys configured. AI features will not work.');
}

export const ai = primaryKey 
  ? createAIWithKey(primaryKey)
  : genkit({
      plugins: [googleAI()], // Fallback to env variable GOOGLE_API_KEY
      model: 'googleai/gemini-3-flash-preview',
    });
