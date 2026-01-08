// src/ai/api-key-manager.ts
/**
 * API Key Manager for Gemini AI
 * 
 * Manages multiple API keys to distribute quota usage across different keys.
 * When one key hits quota limits, the system can automatically retry with another key.
 */

// Load API keys from environment variables
const API_KEYS = [
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2,
].filter((key): key is string => Boolean(key)); // Filter out undefined keys

let currentKeyIndex = 0;

/**
 * Get the next available API key in rotation
 * @returns The next API key, or undefined if no keys are available
 */
export function getNextApiKey(): string | undefined {
  if (API_KEYS.length === 0) {
    console.warn('[API Key Manager] No API keys configured. Please set GEMINI_API_KEY1 or GEMINI_API_KEY2.');
    return undefined;
  }

  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  
  return key;
}

/**
 * Get all available API keys for retry logic
 * @returns Array of all configured API keys
 */
export function getAllApiKeys(): string[] {
  return [...API_KEYS];
}

/**
 * Get the count of available API keys
 * @returns Number of configured API keys
 */
export function getApiKeyCount(): number {
  return API_KEYS.length;
}

/**
 * Reset the key rotation index (useful for testing)
 */
export function resetKeyRotation(): void {
  currentKeyIndex = 0;
}
