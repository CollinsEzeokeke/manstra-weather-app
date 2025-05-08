import { NextRequest, NextResponse } from 'next/server';
// Import the agent directly
import { geminiWeatherChatAgent } from '@/mastra/agents';

// Define thread storage for conversation memory
const activeThreads: Record<string, { messages: { role: string, content: string }[] }> = {};

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Received chat message:', message, 'threadId:', threadId || 'none');

    let currentThreadId = threadId || `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Generate a response using the Gemini agent directly
      const response = await geminiWeatherChatAgent.generate(message, {
        threadId: currentThreadId
      });
      
      console.log('Generated response from Gemini agent, thread:', currentThreadId);
      
      return NextResponse.json({
        response: response.text,
        threadId: currentThreadId
      });
    } catch (agentError) {
      console.error('Error with Gemini agent:', agentError);
      throw agentError;
    }
  } catch (error) {
    console.error('Error in weather chat:', error);
    let errorMessage = 'Failed to process chat message';
    
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 