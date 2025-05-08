// API Keys initialization

// This ensures these APIs are only loaded on the server side
import 'server-only';

// Set API keys from environment variables
if (typeof process !== 'undefined') {
  // Check if environment variable is set
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables.');
    console.warn('Please create a .env.local file based on env.example with your API key.');
    // For development convenience, temporarily set a fallback key if needed
    // In production, you would want to throw an error here instead
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AIzaSyCYBMYAIIymtPvZIKJ6dDMv75f10gjcHZk';
  } else {
    console.log('✅ Gemini API key configured from environment variables');
  }
}

export {}; 