'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WeatherChat from '../components/WeatherChat';
// import Head from 'next/head';

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

export default function ChatPage() {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location');
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch weather data when location param changes
  useEffect(() => {
    async function fetchWeatherData() {
      if (!locationParam) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/weather', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location: locationParam }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch weather data');
        }

        setWeatherData(data.weatherData);
        // Set the page title with the location
        document.title = `Weather Chat - ${data.weatherData.location}`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        document.title = 'Weather Chat';
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeatherData();
    
    // Default title when no location
    if (!locationParam) {
      document.title = 'Weather Chat - Powered by Gemini';
    }
  }, [locationParam]);
  
  return (
    <main className="p-4 md:p-8 min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-rose-300 tracking-tight">
          Weather Assistant {weatherData && `- ${weatherData.location}`}
        </h1>
        
        {locationParam && !weatherData && loading && (
          <div className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            <div className="flex justify-center space-x-2 mb-4">
              <div className="h-3 w-3 bg-rose-400 rounded-full animate-bounce"></div>
              <div className="h-3 w-3 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="h-3 w-3 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <p>Loading weather data for {locationParam}...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg mb-4 max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {!locationParam && (
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Talk to our AI assistant powered by Google Gemini about weather patterns, climate science, or get recommendations for activities based on current conditions.
          </p>
        )}
        
        <div className="relative">
          {/* Decorative elements with rose gold accents */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-rose-300/30 rounded-full opacity-70 blur-md"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-rose-400/20 rounded-full opacity-70 blur-md"></div>
          
          <WeatherChat weatherData={weatherData || undefined} />
        </div>
        
        <footer className="mt-10 text-center text-gray-400 text-sm">
          <p>Manstra Weather App © {new Date().getFullYear()} | Powered by Google Gemini</p>
        </footer>
      </div>
    </main>
  );
} 