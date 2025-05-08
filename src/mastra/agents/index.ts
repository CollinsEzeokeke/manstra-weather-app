import { google } from '@ai-sdk/google';
// import { Anthropic } from "@ai-sdk/";
import 'server-only';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools';
// Import API keys initialization
import '@/lib/apiKeys';

// Create a weather agent using Gemini model
export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.

      When asked to create AI insights for a location's weather, format your response as JSON with this structure:
      {
        "description": "A detailed description of how this weather feels and affects daily life",
        "healthTips": ["Health tip 1", "Health tip 2", "Health tip 3"],
        "fashionAdvice": ["Fashion advice 1", "Fashion advice 2", "Fashion advice 3"],
        "recommendedActivities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4", "Activity 5"]
      }
`,
  model: google('gemini-1.5-flash'),
  tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../weather.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});

// Create a new agent using Gemini model for weather chat
export const geminiWeatherChatAgent = new Agent({
  name: 'Gemini Weather Chat',
  instructions: `
      You are a friendly and helpful weather assistant powered by Gemini AI.

      Your primary functions are:
      1. Provide conversational answers about weather-related topics
      2. Explain weather phenomena, climate patterns, and meteorological concepts
      3. Give advice on weather preparedness and activities based on conditions
      4. Answer questions about seasonal weather patterns in different regions
      
      Guidelines for responses:
      - Be conversational and friendly in your tone
      - When you don't have exact weather data for a location, focus on general information
      - Explain complex weather concepts in simple terms
      - Suggest appropriate activities for different weather conditions
      - Avoid making specific predictions for future weather without data
      
      Remember that you don't have access to real-time weather data, so focus on providing
      educational information about weather rather than current conditions.
  `,
  model: google('gemini-1.5-flash'),
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../gemini-weather-chat.db',
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
}); 