'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Add weather data type to be passed to the component
interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  precipitation: number;
  rain: number;
  snow: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  isDay: boolean;
  conditions: string;
  location: string;
  timezone: string;
  forecast?: {
    dates: string[];
    maxTemps: number[];
    minTemps: number[];
    precipitation: number[];
    conditions: string[];
  };
}

// Update component to accept weather data as prop
export default function WeatherChat({ weatherData }: { weatherData?: WeatherData }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: weatherData 
        ? `Hello! I'm your weather assistant powered by Gemini AI. I see you're interested in the weather in ${weatherData.location}, where it's currently ${weatherData.conditions} at ${Math.round(weatherData.temperature)}°. What would you like to know about this weather?`
        : 'Hello! I\'m your weather assistant powered by Gemini AI. Ask me anything about weather or climate!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when weatherData changes
  useEffect(() => {
    if (weatherData) {
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your weather assistant powered by Gemini AI. I see you're interested in the weather in ${weatherData.location}, where it's currently ${weatherData.conditions} at ${Math.round(weatherData.temperature)}°. What would you like to know about this weather?`
      }]);
    }
  }, [weatherData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsLoading(true);
    
    try {
      console.log('Sending message to API:', input);
      const res = await fetch('/api/weather-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId,
          // Include current weather data if available
          weatherData: weatherData ? {
            location: weatherData.location,
            conditions: weatherData.conditions,
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            precipitation: weatherData.precipitation,
            forecast: weatherData.forecast
          } : undefined
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', res.status, errorText);
        throw new Error(`Failed to get response: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('API response received:', data);
      
      // Save thread ID if provided
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = 'Sorry, I encountered an error connecting to the AI service. Please try again in a moment.';
      
      // Try to extract a more specific error message if available
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // Add assistant error response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  }

  return (
    <div className="flex flex-col h-[650px] max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-gray-800 border border-gray-700">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 font-semibold flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span className="text-xl text-rose-100">
            {weatherData ? `Weather Chat - ${weatherData.location}` : 'Weather Chat'}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-xs px-3 py-1 rounded-full bg-rose-500/80 shadow-sm font-medium text-gray-900">
            AI Powered by Gemini
          </span>
        </div>
      </div>
      
      {/* Chat messages with improved styling */}
      <div className="flex-1 p-5 overflow-y-auto bg-gray-900">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div 
              key={i} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-md ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white' 
                    : 'bg-gray-800 border border-gray-700 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-base">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 shadow-md max-w-[85%]">
                <div className="flex space-x-2 items-center">
                  <div className="h-2 w-2 bg-rose-400 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area with modern styling */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={weatherData 
              ? `Ask about weather in ${weatherData.location}...` 
              : "Ask about weather, climate, or meteorology..."}
            className="flex-1 border border-gray-600 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-100 placeholder-gray-400 bg-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-full p-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 