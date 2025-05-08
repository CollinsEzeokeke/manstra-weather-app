import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';

import { weatherAgent, geminiWeatherChatAgent } from './agents';

export const mastra = new Mastra({
  agents: { weatherAgent, geminiWeatherChatAgent },
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
}); 