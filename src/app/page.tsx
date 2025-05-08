'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateAI, setAnimateAI] = useState(false);
  const [showWeatherEffect, setShowWeatherEffect] = useState(false);
  
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
    setShowWeatherEffect(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to determine weather background class
  const getWeatherBackground = () => {
    if (!weatherData) return '';
    
    const condition = weatherData.conditions.toLowerCase();
    if (condition.includes('clear') || condition.includes('mainly clear')) {
      return 'bg-gradient-to-b from-blue-400 to-blue-600';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return 'bg-gradient-to-b from-gray-300 to-gray-500';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'bg-gradient-to-b from-blue-700 to-gray-800';
    } else if (condition.includes('snow')) {
      return 'bg-gradient-to-b from-blue-100 to-gray-300';
    } else if (condition.includes('fog')) {
      return 'bg-gradient-to-b from-gray-400 to-gray-600';
    } else if (condition.includes('thunder')) {
      return 'bg-gradient-to-b from-gray-700 to-purple-900';
    }
    
    // Default
    return 'bg-gradient-to-b from-blue-300 to-blue-500';
  };

  // Display appropriate weather icon
  const getWeatherIcon = () => {
    if (!weatherData) return null;
    
    const condition = weatherData.conditions.toLowerCase();
    if (condition.includes('clear') || condition.includes('mainly clear')) {
      return <span className="text-6xl">☀️</span>;
    } else if (condition.includes('partly cloudy')) {
      return <span className="text-6xl">⛅</span>;
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return <span className="text-6xl">☁️</span>;
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return <span className="text-6xl">🌧️</span>;
    } else if (condition.includes('snow')) {
      return <span className="text-6xl">❄️</span>;
    } else if (condition.includes('fog')) {
      return <span className="text-6xl">🌫️</span>;
    } else if (condition.includes('thunder')) {
      return <span className="text-6xl">⚡</span>;
    }
    
    return <span className="text-6xl">🌤️</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 py-12 px-4 relative overflow-hidden">
      {/* Animated background dots - FIXED */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white/10"
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

      <main className="max-w-xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className={`h-12 w-12 rounded-full border-2 border-blue-300 flex items-center justify-center 
              ${animateAI ? 'animate-pulse' : ''}`}>
              <div className="text-blue-300 font-bold text-xl">AI</div>
            </div>
            {animateAI && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 animate-ping"></div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-center text-white">
            WeatherAI <span className="text-blue-300">Insights</span>
          </h1>
        </div>
        
        <div className={`backdrop-blur-lg bg-white/10 rounded-xl overflow-hidden shadow-2xl 
          transform transition-all duration-500 border border-white/20
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
                    className="flex-1 px-10 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 font-medium transition-all"
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
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
                        className="h-2 w-2 bg-blue-300 rounded-full" 
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
                  
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
                    <div className="flex justify-center mb-6">
                      <div className="text-center">
                        <span className="text-5xl font-bold text-white">{Math.round(weatherData.temperature)}°</span>
                        <p className="text-white/80 mt-1">Feels like {Math.round(weatherData.feelsLike)}°</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white/10 p-4 rounded-lg">
                        <p className="text-white/70 text-sm">Humidity</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 mr-2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.humidity}%</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-lg">
                        <p className="text-white/70 text-sm">Wind Speed</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 mr-2">
                            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.windSpeed} km/h</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-lg">
                        <p className="text-white/70 text-sm">Wind Gust</p>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 mr-2">
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-6 3.3 4 4 0 0 1-1.7-3 4 4 0 0 1 4.5-4 4 4 0 0 1 1.7.7 4 4 0 0 1 .3.3 4 4 0 0 1 1.4 3"></path>
                          </svg>
                          <p className="text-xl font-medium text-white">{weatherData.windGust} km/h</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-white/5 p-3 rounded-lg">
                      <p className="text-white/90 text-center">
                        <span className="text-blue-300 font-semibold">AI Insight:</span> {' '}
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
                  </div>
                </div>
              </div>
            )}
            
            {!weatherData && !loading && !error && (
              <div className="py-8 text-center">
                <div className="inline-block mb-4 text-blue-300 opacity-80">
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
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-full transition"
                  >
                    London
                  </button>
                  <button 
                    onClick={() => setLocation('New York')}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-full transition"
                  >
                    New York
                  </button>
                  <button 
                    onClick={() => setLocation('Tokyo')}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-full transition"
                  >
                    Tokyo
                  </button>
                  <button 
                    onClick={() => setLocation('Sydney')}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-full transition"
                  >
                    Sydney
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-3 bg-black/20 border-t border-white/10">
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
