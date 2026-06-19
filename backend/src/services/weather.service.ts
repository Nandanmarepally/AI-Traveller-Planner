import axios from 'axios';

export interface WeatherData {
  condition: 'sunny' | 'rainy' | 'cloudy' | 'mixed' | 'unknown';
  temperature: number;
  description: string;
}

// WMO Weather interpretation codes → our simplified categories
const interpretWeatherCode = (code: number): { condition: WeatherData['condition']; description: string } => {
  if (code === 0) return { condition: 'sunny', description: 'Clear sky' };
  if (code <= 2) return { condition: 'sunny', description: 'Mainly clear' };
  if (code === 3) return { condition: 'cloudy', description: 'Overcast' };
  if (code <= 49) return { condition: 'cloudy', description: 'Foggy or hazy' };
  if (code <= 69) return { condition: 'rainy', description: 'Drizzle or light rain' };
  if (code <= 79) return { condition: 'rainy', description: 'Snow or sleet' };
  if (code <= 82) return { condition: 'rainy', description: 'Rain showers' };
  if (code <= 86) return { condition: 'mixed', description: 'Snow showers' };
  if (code <= 99) return { condition: 'rainy', description: 'Thunderstorm' };
  return { condition: 'unknown', description: 'Unknown weather' };
};

// Geocode destination → lat/lon using Open-Meteo geocoding
const geocodeDestination = async (destination: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: destination, count: 1, language: 'en', format: 'json' },
      timeout: 5000,
    });

    const results = response.data?.results;
    if (!results || results.length === 0) return null;

    return { lat: results[0].latitude, lon: results[0].longitude };
  } catch {
    return null;
  }
};

// Fetch current weather for destination
export const getDestinationWeather = async (destination: string): Promise<WeatherData> => {
  try {
    const coords = await geocodeDestination(destination);
    if (!coords) {
      return { condition: 'unknown', temperature: 25, description: 'Weather data unavailable' };
    }

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: ['temperature_2m', 'weathercode'],
        forecast_days: 1,
      },
      timeout: 5000,
    });

    const current = response.data?.current;
    if (!current) {
      return { condition: 'unknown', temperature: 25, description: 'Weather data unavailable' };
    }

    const temp = Math.round(current.temperature_2m);
    const { condition, description } = interpretWeatherCode(current.weathercode);

    return { condition, temperature: temp, description };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { condition: 'unknown', temperature: 25, description: 'Weather data unavailable' };
  }
};

// Build weather context string for the AI prompt
export const buildWeatherContext = (weather: WeatherData): string => {
  if (weather.condition === 'unknown') return '';

  const indoorActivities = 'museums, aquariums, shopping malls, art galleries, indoor markets, spa treatments, cooking classes';
  const outdoorActivities = 'parks, hiking trails, outdoor markets, sightseeing tours, beaches, cycling routes, rooftop bars';

  const activityHint =
    weather.condition === 'rainy'
      ? `Since it's rainy (${weather.description}, ${weather.temperature}°C), prioritize indoor activities like ${indoorActivities}.`
      : weather.condition === 'sunny'
      ? `Since it's sunny (${weather.description}, ${weather.temperature}°C), prioritize outdoor activities like ${outdoorActivities}.`
      : `Weather is ${weather.description} at ${weather.temperature}°C. Mix indoor and outdoor activities.`;

  return activityHint;
};
