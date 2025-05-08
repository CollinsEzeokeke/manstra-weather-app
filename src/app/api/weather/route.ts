import { NextRequest, NextResponse } from 'next/server';

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
    timezone: string;
  }[];
}

interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
    pressure_msl: number;
    surface_pressure: number;
    cloud_cover: number;
    visibility: number;
    is_day: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { location } = await request.json();
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const weatherData = await getWeather(location);
    return NextResponse.json({ weatherData });
  } catch (error) {
    console.error('Error processing weather request:', error);
    return NextResponse.json(
      { error: 'Failed to process weather request' },
      { status: 500 }
    );
  }
}

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name, country, timezone } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=${timezone}`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  // Format the full location name
  const formattedLocation = country ? `${name}, ${country}` : name;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    rain: data.current.rain,
    snow: data.current.snowfall,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    windGust: data.current.wind_gusts_10m,
    pressure: data.current.pressure_msl,
    cloudCover: data.current.cloud_cover,
    visibility: data.current.visibility,
    isDay: Boolean(data.current.is_day),
    conditions: getWeatherCondition(data.current.weather_code),
    location: formattedLocation,
    forecast: data.daily ? {
      dates: data.daily.time,
      maxTemps: data.daily.temperature_2m_max,
      minTemps: data.daily.temperature_2m_min,
      precipitation: data.daily.precipitation_sum,
      conditions: data.daily.weather_code.map(getWeatherCondition)
    } : undefined,
    timezone
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
} 