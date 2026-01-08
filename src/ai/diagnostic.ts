// Quick diagnostic script to check if API keys are loaded correctly
// Run this to verify your environment variables are set

import { getAllApiKeys, getApiKeyCount } from '@/ai/api-key-manager';

console.log('='.repeat(60));
console.log('API KEY DIAGNOSTIC');
console.log('='.repeat(60));

console.log('\nEnvironment Variables:');
console.log('GEMINI_API_KEY1:', process.env.GEMINI_API_KEY1 ? '✅ Set' : '❌ Not set');
console.log('GEMINI_API_KEY2:', process.env.GEMINI_API_KEY2 ? '✅ Set' : '❌ Not set');

const keys = getAllApiKeys();
const count = getApiKeyCount();

console.log(`\nLoaded API Keys: ${count}`);

if (count > 0) {
  keys.forEach((key, index) => {
    const preview = key.substring(0, 15) + '...';
    console.log(`  Key ${index + 1}: ${preview}`);
  });
} else {
  console.log('\n⚠️  WARNING: No API keys loaded!');
  console.log('\nTo fix this:');
  console.log('1. Create/edit .env.local file in project root');
  console.log('2. Add these lines:');
  console.log('   GEMINI_API_KEY1=your_first_key_here');
  console.log('   GEMINI_API_KEY2=your_second_key_here');
  console.log('3. Restart the dev server');
}

console.log('\n' + '='.repeat(60));

export {};
