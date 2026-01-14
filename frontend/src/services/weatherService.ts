import api from '../config/api';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface OutfitSuggestions {
  clothing: string[];
  accessories: string[];
  tips: string[];
  layers: number;
}

export interface WeatherResponse {
  weather: WeatherData;
  suggestions: OutfitSuggestions;
}

export interface ForecastDay {
  date: Date;
  temp: number;
  condition: string;
  description: string;
  icon: string;
  suggestions: OutfitSuggestions;
}

export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to default location (e.g., New York)
        resolve({
          lat: 40.7128,
          lon: -74.0060
        });
      }
    );
  });
};

export const getCurrentWeather = async (): Promise<WeatherResponse> => {
  try {
    const location = await getUserLocation();
    const response = await api.get('/weather/current', {
      params: {
        lat: location.lat,
        lon: location.lon
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    throw error;
  }
};

export const getWeatherForecast = async (days: number = 7): Promise<ForecastDay[]> => {
  try {
    const location = await getUserLocation();
    const response = await api.get('/weather/forecast', {
      params: {
        lat: location.lat,
        lon: location.lon,
        days
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch forecast:', error);
    throw error;
  }
};

export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};
