import { NextRequest, NextResponse } from 'next/server';
// Import the agent directly
import 'server-only';
import { geminiWeatherChatAgent } from '@/mastra/agents';

// interface WeatherDataInput {
//   location: string;
//   conditions: string;
//   temperature: number;
//   humidity?: number;
//   windSpeed?: number;
//   precipitation?: number;
//   forecast?: {
//     dates: string[];
//     maxTemps: number[];
//     minTemps: number[];
//     precipitation: number[];
//     conditions: string[];
//   };
// }

export async function POST(request: NextRequest) {
  try {
    const { message, threadId, weatherData } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Received chat message:', message, 'threadId:', threadId || 'none');
    console.log('Weather data available:', weatherData ? 'yes' : 'no');

    // Generate a response using the Gemini agent directly
    try {
      // Enhance prompt with weather data if available
      let enhancedMessage = message;
      
      if (weatherData) {
        const weatherDataInfo = `
          Current weather in ${weatherData.location}:
          - Conditions: ${weatherData.conditions}
          - Temperature: ${weatherData.temperature}°C
          ${weatherData.humidity ? `- Humidity: ${weatherData.humidity}%` : ''}
          ${weatherData.windSpeed ? `- Wind Speed: ${weatherData.windSpeed} km/h` : ''}
          ${weatherData.precipitation ? `- Precipitation: ${weatherData.precipitation} mm` : ''}
          
          ${weatherData.forecast ? `Forecast for the coming days:
            ${weatherData.forecast.dates.map((date: string, i: number) => 
              `- ${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: 
                ${weatherData.forecast!.conditions[i]}, 
                ${Math.round(weatherData.forecast!.minTemps[i])}°-${Math.round(weatherData.forecast!.maxTemps[i])}°`
            ).join('\n')}
          ` : ''}
        `;
        
        enhancedMessage = `
          I'm looking at the weather in ${weatherData.location}. Here's the current data:
          
          ${weatherDataInfo}
          
          Based on this actual weather data, please answer my question: ${message}
          
          Be specific to this location and these weather conditions in your response.
        `;
      }
      
      const response = await geminiWeatherChatAgent.generate(enhancedMessage);
      
      console.log('Generated response from Gemini agent');
      
      return NextResponse.json({
        response: response.text,
        // We don't need to track threadId separately as it's handled by the memory system
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