import { NextResponse } from 'next/server';
import { geminiWeatherChatAgent } from '@/mastra/agents';

export async function GET() {
  try {
    // We don't need to check for a server anymore since we're using the agents directly
    // Just do a simple check to make sure the agent is available
    if (geminiWeatherChatAgent) {
      return NextResponse.json({ 
        status: 'online',
        geminiAgentAvailable: true
      });
    } else {
      return NextResponse.json({ 
        status: 'offline',
        error: 'Gemini agent not available'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error checking agent availability:', error);
    return NextResponse.json({ 
      status: 'offline', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
} 