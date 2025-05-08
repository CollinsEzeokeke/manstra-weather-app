'use client';

import { useState, useEffect, useRef } from 'react';
import WeatherChat from './components/WeatherChat';

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

interface AIInsights {
  description: string;
  healthTips: string[];
  fashionAdvice: string[];
}

interface AIResponse {
  insights: AIInsights;
  recommendedActivities: string[];
  isAgentResponse?: boolean;
  rawAgentResponse?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Adding a deterministic particle generator
const generateParticles = () => {
  // Using a fixed seed approach instead of Math.random()
  const particles = [];
  for (let i = 0; i < 20; i++) {
    // Using deterministic values based on index
    const size = 2 + (i % 5) * 1.2;
    particles.push({
      id: i,
      width: size,
      height: size,
      top: `${(i * 5) % 100}%`,
      left: `${(i * 7) % 100}%`,
      animation: `float ${10 + (i % 10)}s linear infinite`
    });
  }
  return particles;
};

export default function Home() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateAI, setAnimateAI] = useState(false);
  const [showWeatherEffect, setShowWeatherEffect] = useState(false);
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  // const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // Pre-generate particles with deterministic values
  const particles = generateParticles();

  // Timer for simulating AI "thinking"
  useEffect(() => {
    if (loading) {
      setAnimateAI(true);
    } else {
      setTimeout(() => {
        setAnimateAI(false);
      }, 500);
    }
  }, [loading]);

  // Show weather background effect when data is loaded
  useEffect(() => {
    if (weatherData) {
      setTimeout(() => {
        setShowWeatherEffect(true);
      }, 300);
    } else {
      setShowWeatherEffect(false);
    }
  }, [weatherData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);
    setAiInsights(null);
    setShowWeatherEffect(false);
    setChatMessages([]);
    setShowChat(false);

    try {
      // Artificial delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }

      setWeatherData(data.weatherData);
      
      // After getting weather data, fetch AI insights
      if (data.weatherData) {
        setInsightsLoading(true);
        try {
          const insightsResponse = await fetch('/api/ai-insights', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              location: data.weatherData.location,
              conditions: data.weatherData.conditions,
              temperature: data.weatherData.temperature,
            }),
          });
          
          const insightsData = await insightsResponse.json();
          if (insightsResponse.ok) {
            // Add small delay to make the insights appear after weather data
            setTimeout(() => {
              setAiInsights(insightsData);
              setInsightsLoading(false);
            }, 800);
          } else {
            console.error('Failed to fetch AI insights:', insightsData.error);
            setInsightsLoading(false);
          }
        } catch (err) {
          console.error('Error fetching AI insights:', err);
          setInsightsLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sending a chat message to the AI
  // const handleSendMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!chatInput.trim() || !weatherData) return;
    
  //   const userMessage = chatInput.trim();
  //   setChatInput('');
  //   // setChatLoading(true);
    
  //   // Add the user message to the chat
  //   setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
  //   try {
  //     // Send the message to the AI insights endpoint
  //     const response = await fetch('/api/weather-chat', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         message: userMessage,
  //         weatherData: {
  //           location: weatherData.location,
  //           conditions: weatherData.conditions,
  //           temperature: weatherData.temperature,
  //           humidity: weatherData.humidity,
  //           windSpeed: weatherData.windSpeed,
  //           precipitation: weatherData.precipitation,
  //           forecast: weatherData.forecast,
  //         },
  //       }),
  //     });
      
  //     const data = await response.json();
      
  //     if (response.ok && data.response) {
  //       // Add the AI response to the chat
  //       setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
  //     } else {
  //       // If there was an error, add a fallback message
  //       setChatMessages(prev => [...prev, { 
  //         role: 'assistant', 
  //         content: "I'm sorry, I couldn't process your request. Could you try asking something else about the weather?" 
  //       }]);
  //     }
  //   } catch (error) {
  //     console.error('Error in chat:', error);
  //     // Add error message to chat
  //     setChatMessages(prev => [...prev, { 
  //       role: 'assistant', 
  //       content: "I'm sorry, there was an error processing your message. Please try again." 
  //     }]);
  //   } finally {
  //     // setChatLoading(false);
  //   }
  // };

  // Function to determine weather background class
  const getWeatherBackground = () => {
    if (!weatherData) return '';
    
    const condition = weatherData.conditions.toLowerCase();
    if (condition.includes('clear') || condition.includes('mainly clear')) {
      return 'bg-gradient-to-b from-gray-800 to-gray-900 border border-rose-800/20';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return 'bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'bg-gradient-to-b from-gray-900 to-gray-800 border border-blue-900/30';
    } else if (condition.includes('snow')) {
      return 'bg-gradient-to-b from-gray-900 to-gray-800 border border-blue-700/20';
    } else if (condition.includes('fog')) {
      return 'bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600';
    } else if (condition.includes('thunder')) {
      return 'bg-gradient-to-b from-gray-900 to-gray-800 border border-purple-900/30';
    }
    
    // Default
    return 'bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700';
  };

  // Display appropriate weather icon
  const getWeatherIcon = () => {
    if (!weatherData) return null;
    
    const condition = weatherData.conditions.toLowerCase();
    return getWeatherIconForCondition(condition);
  };
  
  // Helper function to get weather icon based on condition string
  const getWeatherIconForCondition = (condition: string, scale: 'large' | 'medium' | 'small' = 'large') => {
    const conditionLower = condition.toLowerCase();
    
    const sizeClass = scale === 'large' ? 'text-6xl' : scale === 'medium' ? 'text-4xl' : 'text-2xl';
    
    if (conditionLower.includes('clear') || conditionLower.includes('mainly clear')) {
      return <span className={sizeClass}>☀️</span>;
    } else if (conditionLower.includes('partly cloudy')) {
      return <span className={sizeClass}>⛅</span>;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return <span className={sizeClass}>☁️</span>;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <span className={sizeClass}>🌧️</span>;
    } else if (conditionLower.includes('snow')) {
      return <span className={sizeClass}>❄️</span>;
    } else if (conditionLower.includes('fog')) {
      return <span className={sizeClass}>🌫️</span>;
    } else if (conditionLower.includes('thunder')) {
      return <span className={sizeClass}>⚡</span>;
    }
    
    return <span className={sizeClass}>🌤️</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 py-12 px-4 relative overflow-hidden">
      {/* Animated background dots - FIXED */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-rose-300/10"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                top: particle.top,
                left: particle.left,
                animation: particle.animation
              }}
            />
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className={`h-12 w-12 rounded-full border-2 border-rose-300 flex items-center justify-center 
              ${animateAI ? 'animate-pulse' : ''}`}>
              <div className="text-rose-300 font-bold text-xl">AI</div>
            </div>
            {animateAI && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-400 animate-ping"></div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-center text-white">
            Weather<span className="text-rose-300">AI</span>
          </h1>
        </div>
        
        <div className={`backdrop-blur-lg bg-gray-800/30 rounded-xl overflow-hidden shadow-2xl 
          transform transition-all duration-500 border border-gray-700
          ${loading ? 'scale-98' : 'scale-100'}`}>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex flex-col gap-3">
                <label htmlFor="location" className="text-white/90 font-medium">
                  Where would you like to check the weather?
                </label>
                <div className="flex items-center gap-2 relative">
                  <div className="absolute left-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city name..."
                    className="flex-1 px-10 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-lg hover:from-rose-600 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-70 font-medium transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing</span>
                      </div>
                    ) : (
                      <span>Get Weather</span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-bounce mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                    <path d="M8 16a4 4 0 0 0 8 0 3 3 0 0 0-8-5"></path>
                    <path d="M7 16a4 4 0 0 1-2-3 3 3 0 0 1 4-4"></path>
                    <line x1="8" y1="9" x2="8" y2="9"></line>
                    <line x1="16" y1="9" x2="16" y2="9"></line>
                  </svg>
                </div>
                <div className="text-white/90 animate-pulse">
                  <p className="text-lg">AI is analyzing weather patterns...</p>
                  <div className="mt-2 flex justify-center space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i} 
                        className="h-2 w-2 bg-rose-300 rounded-full" 
                        style={{ 
                          animation: `bounce 1.4s infinite ease-in-out both`,
                          animationDelay: `${i * 0.16}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg mb-4 animate-fade-in">
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

            {weatherData && (
              <div className={`transition-all duration-500 rounded-lg overflow-hidden 
                ${showWeatherEffect ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
                <div className={`${getWeatherBackground()} p-6 transition-all duration-500`}>
                  <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">
                        {weatherData.location}
                      </h2>
                      <p className="text-white/80 font-medium">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-center">
                      {getWeatherIcon()}
                      <p className="text-white font-semibold mt-2">{weatherData.conditions}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                    <div className="flex justify-center mb-6">
                      <div className="text-center">
                        <span className="text-5xl font-bold text-white">{Math.round(weatherData.temperature)}°</span>
                        <p className="text-white/80 mt-1">Feels like {Math.round(weatherData.feelsLike)}°</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                        <p className="text-white/70 text-sm">Humidity</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 mr-2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.humidity}%</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                        <p className="text-white/70 text-sm">Wind Speed</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 mr-2">
                            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.windSpeed} km/h</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                        <p className="text-white/70 text-sm">Wind Gust</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 mr-2">
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-6 3.3 4 4 0 0 1-1.7-3 4 4 0 0 1 4.5-4 4 4 0 0 1 1.7.7 4 4 0 0 1 .3.3 4 4 0 0 1 1.4 3"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.windGust} km/h</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                        <p className="text-white/70 text-sm">Precipitation</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 mr-2">
                            <path d="M12 22a8 8 0 0 1-8-8c0-3.5 2.5-6 3-6.5 1-1 2-3.5 2-5.5.5 1 2 2 3 2s2.5-1 3-2c0 2-1 4.5-2 5.5-.5.5-3 3-3 6.5a8 8 0 0 1-8 8Z"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.precipitation} mm</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                        <p className="text-white/70 text-sm">Cloud Cover</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 mr-2">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.cloudCover}%</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                        <p className="text-white/70 text-sm">Pressure</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 mr-2">
                            <path d="M12 2v2"></path>
                            <path d="M12 8v2"></path>
                            <path d="M12 14v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="m19.07 4.93-1.41 1.41"></path>
                            <path d="m15.66 8.34-1.41 1.41"></path>
                            <path d="m8.34 15.66-1.41 1.41"></path>
                            <path d="m4.93 19.07-1.41 1.41"></path>
                            <path d="M22 12h-2"></path>
                            <path d="M16 12h-2"></path>
                            <path d="M10 12H8"></path>
                            <path d="M4 12H2"></path>
                            <path d="m4.93 4.93 1.41 1.41"></path>
                            <path d="m8.34 8.34 1.41 1.41"></path>
                            <path d="m15.66 15.66 1.41 1.41"></path>
                            <path d="m19.07 19.07 1.41 1.41"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.pressure} hPa</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Forecast Section */}
                    {weatherData.forecast && (
                      <div className="mt-6 bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                        <h3 className="text-lg font-semibold text-white mb-3">7-Day Forecast</h3>
                        <div className="overflow-x-auto">
                          <div className="flex min-w-max space-x-4">
                            {weatherData.forecast.dates.map((date, index) => {
                              const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric'
                              });
                              return (
                                <div key={index} className="flex-shrink-0 w-24 bg-gray-700/40 rounded-lg p-3 text-center border border-gray-600/30">
                                  <p className="text-white/80 text-sm font-medium">{index === 0 ? 'Today' : formattedDate}</p>
                                  <div className="my-2">
                                    {getWeatherIconForCondition(weatherData.forecast!.conditions[index], 'small')}
                                  </div>
                                  <p className="text-xs text-white/70 h-8 overflow-hidden">{weatherData.forecast!.conditions[index].split(' ').slice(0, 2).join(' ')}</p>
                                  <div className="mt-2 flex justify-between items-center px-1">
                                    <span className="text-rose-300 text-xs">{Math.round(weatherData.forecast!.minTemps[index])}°</span>
                                    <span className="text-white text-sm font-medium">{Math.round(weatherData.forecast!.maxTemps[index])}°</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Simple AI Insight (will be replaced by real AI insights) */}
                    {!aiInsights && !insightsLoading && (
                      <div className="mt-6 bg-gray-800/40 p-3 rounded-lg border border-gray-700/50">
                        <p className="text-white/90 text-center">
                          <span className="text-rose-300 font-semibold">AI Insight:</span> {' '}
                          {weatherData.conditions.includes('Clear') 
                            ? 'Perfect weather for outdoor activities! Make sure to stay hydrated.'
                            : weatherData.conditions.includes('Cloud') 
                            ? 'Partly cloudy conditions might provide some relief from direct sunlight.'
                            : weatherData.conditions.includes('Rain') 
                            ? 'Remember to take an umbrella with you today.'
                            : weatherData.conditions.includes('Snow') 
                            ? 'Bundle up! It\'s snowing outside.'
                            : 'Monitor the weather throughout the day for any changes.'}
                        </p>
                      </div>
                    )}
                    
                    {/* AI Insights Loading Indicator */}
                    {insightsLoading && (
                      <div className="mt-6 bg-gray-800/40 p-5 rounded-lg border border-gray-700/50">
                        <div className="flex justify-center items-center">
                          <svg className="animate-spin h-5 w-5 text-rose-300 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-white/80">AI is generating weather insights...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* AI Insights Display */}
                {aiInsights && (
                  <div className={`bg-gray-900/60 backdrop-blur-lg p-6 border-t border-gray-700 transition-all duration-500 
                    ${aiInsights ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                        <svg className="mr-2 h-5 w-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Weather Insights
                      </h3>
                      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                        <p className="text-white/90">{aiInsights.insights.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <svg className="mr-2 h-5 w-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Health Tips
                        </h4>
                        <ul className="space-y-2">
                          {aiInsights.insights.healthTips.map((tip, index) => (
                            <li key={index} className="bg-gray-800/30 p-3 rounded-lg flex items-start border border-gray-700/50">
                              <span className="text-rose-300 mr-2">•</span>
                              <span className="text-white/90">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <svg className="mr-2 h-5 w-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          Fashion Advice
                        </h4>
                        <ul className="space-y-2">
                          {aiInsights.insights.fashionAdvice.map((advice, index) => (
                            <li key={index} className="bg-gray-800/30 p-3 rounded-lg flex items-start border border-gray-700/50">
                              <span className="text-rose-300 mr-2">•</span>
                              <span className="text-white/90">{advice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <svg className="mr-2 h-5 w-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Recommended Activities
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {aiInsights.recommendedActivities.map((activity, index) => (
                          <div key={index} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                            <p className="text-white/90 text-center">{activity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Chat with Weather AI Button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => setShowChat(prev => !prev)}
                        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-lg hover:from-rose-600 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-70 font-medium transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {showChat ? 'Hide Chat' : 'Chat with Weather AI'}
                      </button>
                      
                      <a
                        href={`/chat?location=${encodeURIComponent(weatherData.location)}`}
                        className="ml-4 px-6 py-3 bg-gray-800 text-rose-300 border border-rose-500/30 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 font-medium transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Full Chat Page
                      </a>
                    </div>
                    
                    {/* Chat Interface */}
                    {showChat && (
                      <div className="mt-6 bg-gray-900/60 rounded-lg p-4 transition-all duration-300 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <svg className="mr-2 h-5 w-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Chat with Weather AI
                        </h3>
                        
                        {/* Replace the custom chat implementation with the WeatherChat component */}
                        <WeatherChat weatherData={weatherData} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!weatherData && !loading && !error && (
              <div className="py-8 text-center">
                <div className="inline-block mb-4 text-rose-300 opacity-80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                  </svg>
                </div>
                <p className="text-white/80">
                  Enter a location above to get the latest weather insights powered by AI
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                  <button 
                    onClick={() => setLocation('London')}
                    className="px-3 py-1 bg-gray-700/40 hover:bg-gray-600/40 text-white/80 rounded-full border border-gray-600/30 transition"
                  >
                    London
                  </button>
                  <button 
                    onClick={() => setLocation('New York')}
                    className="px-3 py-1 bg-gray-700/40 hover:bg-gray-600/40 text-white/80 rounded-full border border-gray-600/30 transition"
                  >
                    New York
                  </button>
                  <button 
                    onClick={() => setLocation('Tokyo')}
                    className="px-3 py-1 bg-gray-700/40 hover:bg-gray-600/40 text-white/80 rounded-full border border-gray-600/30 transition"
                  >
                    Tokyo
                  </button>
                  <button 
                    onClick={() => setLocation('Sydney')}
                    className="px-3 py-1 bg-gray-700/40 hover:bg-gray-600/40 text-white/80 rounded-full border border-gray-600/30 transition"
                  >
                    Sydney
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-3 bg-gray-900/40 border-t border-gray-700/50">
            <p className="text-center text-white/50 text-sm">
              Powered by AI and open weather data • Updated just now
            </p>
          </div>
        </div>
        
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0);
            } 
            40% { 
              transform: scale(1.0);
            }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </main>
    </div>
  );
}
