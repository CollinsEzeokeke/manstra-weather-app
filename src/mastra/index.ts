import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';

import { weatherAgent, geminiWeatherChatAgent } from './agents';

// Get database URL from environment or use local file for development
const getDatabaseUrl = () => {
  // Use environment variable in production (Vercel)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Fallback to local file for development
  return 'file:../mastra.db';
};

export const mastra = new Mastra({
  agents: { weatherAgent, geminiWeatherChatAgent },
  storage: new LibSQLStore({
    url: getDatabaseUrl(),
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
}); 