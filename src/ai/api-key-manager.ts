// src/ai/api-key-manager.ts
/**
 * API Key Manager for Gemini AI
 * 
 * Manages multiple API keys to distribute quota usage across different keys.
 * When one key hits quota limits, the system can automatically retry with another key.
 */

let currentKeyIndex = 0;

/**
 * Get all available API keys (loaded dynamically from environment)
 * @returns Array of all configured API keys
 */
function loadApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY1,
    process.env.GEMINI_API_KEY2,
  ].filter((key): key is string => Boolean(key));
  
  console.log(`[API Key Manager] Loaded ${keys.length} API key(s)`);
  
  if (keys.length === 0) {
    console.warn('[API Key Manager] No API keys configured. Please set GEMINI_API_KEY1 or GEMINI_API_KEY2 in .env.local');
  }
  
  return keys;
}

/**
 * Get the next available API key in rotation
 * @returns The next API key, or undefined if no keys are available
 */
export function getNextApiKey(): string | undefined {
  const apiKeys = loadApiKeys();
  
  if (apiKeys.length === 0) {
    return undefined;
  }

  const key = apiKeys[currentKeyIndex];
  const keyPreview = key ? `${key.substring(0, 10)}...` : 'undefined';
  
  console.log(`[API Key Manager] Returning key at index ${currentKeyIndex} (${keyPreview})`);
  
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  
  return key;
}

/**
 * Get all available API keys for retry logic
 * @returns Array of all configured API keys
 */
export function getAllApiKeys(): string[] {
  const keys = loadApiKeys();
  console.log(`[API Key Manager] getAllApiKeys() returning ${keys.length} key(s)`);
  return [...keys];
}

/**
 * Get the count of available API keys
 * @returns Number of configured API keys
 */
export function getApiKeyCount(): number {
  return loadApiKeys().length;
}

/**
 * Reset the key rotation index (useful for testing)
 */
export function resetKeyRotation(): void {
  console.log('[API Key Manager] Resetting rotation index to 0');
  currentKeyIndex = 0;
}
