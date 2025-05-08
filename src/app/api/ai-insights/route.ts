import { NextRequest, NextResponse } from 'next/server';
// Use 'server-only' to ensure these imports are never used on the client
import 'server-only';
// Import the agents directly - use only the Gemini agent
import { geminiWeatherChatAgent } from '@/mastra/agents';

// Define weather type for type safety
type WeatherType = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'thunderstorm';

// Define fallback data only for error cases
const weatherActivities: Record<WeatherType, string[]> = {
  clear: [
    'Outdoor picnics in local parks',
    'Hiking or nature walks',
    'Outdoor sports like tennis or basketball',
    'Beach or pool activities if available',
    'Outdoor dining at restaurants with patios',
    'Farmers markets or outdoor shopping',
  ],
  cloudy: [
    'Visit to museums or art galleries',
    'Coffee shop hopping',
    'Scenic drives with occasional stops',
    'Photography tours - cloudy days provide good diffused light',
    'Outdoor activities that don\'t require direct sunlight',
    'Light hiking or walking tours',
  ],
  rain: [
    'Visit local museums or art galleries',
    'Indoor shopping malls or boutique stores',
    'Cozy cafés with a good book',
    'Movie theaters or live performances',
    'Indoor sports facilities',
    'Cooking classes or food tours',
  ],
  snow: [
    'Skiing or snowboarding at nearby resorts',
    'Building a snowman or snow sculptures',
    'Sledding or tubing at local hills',
    'Hot chocolate at a cozy café',
    'Indoor museums or art galleries',
    'Winter photography',
  ],
  fog: [
    'Atmospheric photography sessions',
    'Visit to museums or indoor attractions',
    'Cozy café visits',
    'Indoor shopping',
    'Spa day or wellness activities',
    'Local brewery or winery tours',
  ],
  thunderstorm: [
    'Indoor movie marathon',
    'Visit local museums or galleries',
    'Shopping at indoor malls',
    'Cooking or baking activities',
    'Indoor sports or fitness centers',
    'Board games or puzzle activities',
  ],
};

const healthTips: Record<WeatherType, string[]> = {
  clear: [
    'Apply sunscreen with at least SPF 30',
    'Wear a hat and sunglasses for eye protection',
    'Stay hydrated by drinking plenty of water',
  ],
  cloudy: [
    'UV rays can still penetrate clouds, consider sunscreen',
    'Stay hydrated throughout the day',
    'Perfect conditions for longer outdoor activities',
  ],
  rain: [
    'Ensure your footwear has good traction to prevent slips',
    'Dry off completely when coming indoors to prevent chills',
    'Consider a vitamin D supplement due to reduced sunlight',
  ],
  snow: [
    'Layer clothing to trap heat effectively',
    'Keep extremities covered to prevent frostbite',
    'Stay hydrated - cold weather can mask dehydration',
  ],
  fog: [
    'Use reflective clothing if walking or biking',
    'Be cautious when driving - use low beam headlights',
    'Moisturize skin as fog can be dehydrating',
  ],
  thunderstorm: [
    'Stay indoors and away from windows during lightning',
    'Avoid using plugged-in electrical equipment',
    'Be prepared with a flashlight in case of power outages',
  ],
};

const fashionAdvice: Record<WeatherType, string[]> = {
  clear: [
    'Light, breathable fabrics like cotton or linen',
    'Consider light colors to reflect sunlight',
    'Accessorize with sunglasses and a stylish hat',
  ],
  cloudy: [
    'Layer clothing for adaptability to changing conditions',
    'A light jacket or cardigan can be useful',
    'Neutral colors work well on cloudy days',
  ],
  rain: [
    'Waterproof outerwear and footwear are essential',
    'Consider water-resistant fabrics or treatments',
    'A compact umbrella in a vibrant color can brighten the day',
  ],
  snow: [
    'Thermal base layers for insulation',
    'Waterproof boots with good traction',
    'Insulated, waterproof outerwear in bright colors for visibility',
  ],
  fog: [
    'Layers that can be adjusted for changing visibility',
    'Light, reflective elements for safety',
    'Water-resistant outerwear as fog can accumulate moisture',
  ],
  thunderstorm: [
    'Waterproof, hooded outerwear',
    'Skip metal accessories during electrical storms',
    'Quick-drying fabrics for unexpected downpours',
  ],
};

const weatherDescriptions: Record<WeatherType, string> = {
  clear: "The clear skies create a bright and energizing atmosphere. The sunshine provides natural warmth and lifts the mood, making it an ideal day for outdoor activities.",
  cloudy: "The cloudy conditions create a soft, diffused light that's easy on the eyes. The temperature feels moderate with occasional breaks in the cloud cover providing glimpses of sunshine.",
  rain: "The rainfall creates a soothing ambiance with its rhythmic patter. The air feels fresh and clean, while the cooler temperatures encourage cozy indoor activities.",
  snow: "The snowy landscape transforms the environment into a serene winter wonderland. The crisp, cold air feels invigorating, while the snow muffles sounds creating a peaceful atmosphere.",
  fog: "The foggy conditions create a mysterious, ethereal atmosphere with limited visibility. The moisture in the air gives a slight chill and creates a hushed environment as sounds are dampened.",
  thunderstorm: "The dramatic weather creates an intense atmosphere with powerful winds and impressive lightning displays. The air feels charged with electricity, while the rainfall can be heavy and sudden.",
};

export async function POST(request: NextRequest) {
  try {
    const { location, conditions, temperature, message } = await request.json();
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Prepare the prompt for the AI agent
    let content;
    if (message) {
      // If there's a chat message, include it in the prompt
      content = `I'm in ${location} where the weather is ${conditions} at ${temperature}°C. ${message}`;
    } else {
      // Otherwise, ask for structured weather insights
      content = `The weather in ${location} is ${conditions} with a temperature of ${temperature}°C. 
      Based on this weather information, please provide:
      1. A brief description of how this weather feels and affects daily life
      2. 3 health tips for staying comfortable and safe in these conditions
      3. 3 fashion tips for dressing appropriately 
      4. 5 recommended activities suitable for this weather
      
      Present this in a clear, structured format.`;
    }

    // Use Gemini agent directly
    try {
      const geminiResponse = await geminiWeatherChatAgent.generate(content);
        
      const geminiText = geminiResponse.text;
        
      if (message) {
        // If it was a chat message, return directly
        return NextResponse.json({
          agentResponse: geminiText,
          isAgentResponse: true
        });
      } else {
        // Try to parse the Gemini response
        return parseUnstructuredResponse(geminiText, conditions, temperature);
      }
    } catch (geminiError) {
      console.error('Gemini agent error:', geminiError);
      
      // If the Gemini agent fails, use static fallback
      console.warn('Agent failed, using static fallback data');
      return getFallbackResponse(conditions, temperature);
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}

// Parse unstructured text response from the agent
function parseUnstructuredResponse(text: string, conditions: string, temperature: number) {
  // Extract sections using simple text parsing
  const descriptionMatch = text.match(/(?:description|feel|feels like|current weather)(.*?)(?:\n\n|\n\d)/i);
  const healthMatch = text.match(/(?:health tips|health advice|stay healthy)(.*?)(?:\n\n|\n\d)/i);
  const fashionMatch = text.match(/(?:fashion advice|clothing|what to wear|dress)(.*?)(?:\n\n|\n\d)/i);
  const activitiesMatch = text.match(/(?:activities|things to do|recommended activities)(.*?)(?:\n\n|$)/i);

  // Extract lists from the sections
  const getList = (text?: string) => {
    if (!text) return [];
    return text.split(/\n[-•*]\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  // Prepare the response data
  const insights = {
    description: descriptionMatch?.[1]?.trim() || getDefaultDescription(conditions, temperature),
    healthTips: getList(healthMatch?.[1]),
    fashionAdvice: getList(fashionMatch?.[1])
  };

  const activities = getList(activitiesMatch?.[1]);

  // If we couldn't extract any structured data, use fallback
  if (!insights.healthTips.length && !insights.fashionAdvice.length && !activities.length) {
    return getFallbackResponse(conditions, temperature);
  }

  return NextResponse.json({
    insights,
    recommendedActivities: activities.slice(0, 5),
    rawAgentResponse: text,
    isAgentResponse: true
  });
}

// Get fallback response using static data
function getFallbackResponse(conditions: string, temperature: number) {
  const weatherType = getWeatherType(conditions);
  
  return NextResponse.json({
    insights: {
      description: getDefaultDescription(conditions, temperature),
      healthTips: healthTips[weatherType],
      fashionAdvice: fashionAdvice[weatherType]
    },
    recommendedActivities: weatherActivities[weatherType].slice(0, 3),
    isAgentResponse: false
  });
}

// Helper function to determine weather type from conditions string
function getWeatherType(conditions: string): WeatherType {
  const conditionLower = conditions.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('mainly clear')) {
    return 'clear';
  } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloudy';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rain';
  } else if (conditionLower.includes('snow')) {
    return 'snow';
  } else if (conditionLower.includes('fog')) {
    return 'fog';
  } else if (conditionLower.includes('thunder')) {
    return 'thunderstorm';
  }
  
  return 'cloudy'; // Default
}

// Generate a default description based on weather conditions and temperature
function getDefaultDescription(conditions: string, temperature: number): string {
  const weatherType = getWeatherType(conditions);
  const baseDescription = weatherDescriptions[weatherType];
  
  let tempAdvice = "";
  if (temperature < 0) {
    tempAdvice = "The freezing temperatures require extra layers and precautions against frostbite.";
  } else if (temperature < 10) {
    tempAdvice = "The cold temperatures call for proper winter clothing and protection against wind chill.";
  } else if (temperature < 20) {
    tempAdvice = "The mild temperatures are comfortable with appropriate layers that can be adjusted as needed.";
  } else if (temperature < 30) {
    tempAdvice = "The warm temperatures are perfect for light clothing while staying mindful of sun protection.";
  } else {
    tempAdvice = "The hot temperatures require lightweight clothing and extra attention to hydration and sun protection.";
  }

  return `${baseDescription} ${tempAdvice}`;
} 