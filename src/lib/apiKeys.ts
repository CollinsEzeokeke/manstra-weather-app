// API Keys initialization

// This ensures these APIs are only loaded on the server side
import 'server-only';

// Set API keys directly for server-side use
if (typeof process !== 'undefined') {
  // Hard-code the Gemini API key
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AIzaSyCYBMYAIIymtPvZIKJ6dDMv75f10gjcHZk';
  
  // Log confirmation that we've set the API key
  console.log('✅ Gemini API key configured');
}

export {}; 