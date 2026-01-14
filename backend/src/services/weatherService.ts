import axios from 'axios';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface OutfitSuggestions {
  clothing: string[];
  accessories: string[];
  tips: string[];
  layers: number;
}

export const getWeatherByLocation = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    return {
      temp: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather API error:', error);
    // Return demo data if API fails
    return {
      temp: 22,
      feelsLike: 20,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 60,
      windSpeed: 5,
      icon: '01d'
    };
  }
};

export const getWeatherForecast = async (lat: number, lon: number, days: number = 7) => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: days * 8 // 8 data points per day (3-hour intervals)
      }
    });
    
    // Group by day and get daily averages
    const dailyData: any[] = [];
    const grouped = response.data.list.reduce((acc: any, item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
    
    Object.keys(grouped).forEach(date => {
      const dayData = grouped[date];
      const avgTemp = dayData.reduce((sum: number, d: any) => sum + d.main.temp, 0) / dayData.length;
      const mainCondition = dayData[0].weather[0].main;
      
      dailyData.push({
        date: new Date(date),
        temp: Math.round(avgTemp),
        condition: mainCondition,
        description: dayData[0].weather[0].description,
        icon: dayData[0].weather[0].icon
      });
    });
    
    return dailyData.slice(0, days);
  } catch (error) {
    console.error('Weather forecast error:', error);
    // Return demo forecast
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temp: 20 + Math.random() * 10,
      condition: 'Clear',
      description: 'clear sky',
      icon: '01d'
    }));
  }
};

export const getWeatherBasedOutfitSuggestions = (weatherData: WeatherData): OutfitSuggestions => {
  const { temp, condition, windSpeed, humidity } = weatherData;
  
  const suggestions: OutfitSuggestions = {
    clothing: [],
    accessories: [],
    tips: [],
    layers: 1
  };
  
  // Temperature-based suggestions
  if (temp < 0) {
    suggestions.clothing.push('Heavy winter coat', 'Thermal underwear', 'Thick sweater', 'Wool pants', 'Winter boots');
    suggestions.accessories.push('Thick scarf', 'Insulated gloves', 'Warm beanie', 'Ear muffs');
    suggestions.tips.push('⛄ Freezing! Layer up with thermal wear.');
    suggestions.layers = 4;
  } else if (temp < 10) {
    suggestions.clothing.push('Heavy coat', 'Sweater', 'Long pants', 'Boots', 'Long-sleeve shirt');
    suggestions.accessories.push('Scarf', 'Gloves', 'Beanie');
    suggestions.tips.push('🧥 Cold weather - dress warmly!');
    suggestions.layers = 3;
  } else if (temp < 15) {
    suggestions.clothing.push('Jacket', 'Long-sleeve shirt', 'Jeans', 'Closed shoes');
    suggestions.accessories.push('Light scarf');
    suggestions.tips.push('🍂 Cool weather - a jacket is recommended.');
    suggestions.layers = 2;
  } else if (temp < 20) {
    suggestions.clothing.push('Light jacket or cardigan', 'Long sleeves', 'Jeans or pants', 'Sneakers');
    suggestions.tips.push('🌤️ Mild weather - perfect for layering.');
    suggestions.layers = 2;
  } else if (temp < 25) {
    suggestions.clothing.push('T-shirt', 'Light pants or jeans', 'Sneakers', 'Light dress');
    suggestions.tips.push('☀️ Pleasant weather - dress comfortably!');
    suggestions.layers = 1;
  } else if (temp < 30) {
    suggestions.clothing.push('T-shirt', 'Shorts or light pants', 'Sandals', 'Summer dress');
    suggestions.accessories.push('Sunglasses', 'Sun hat');
    suggestions.tips.push('🌞 Warm weather - stay cool and comfortable.');
    suggestions.layers = 1;
  } else {
    suggestions.clothing.push('Tank top', 'Shorts', 'Sandals', 'Light breathable fabrics');
    suggestions.accessories.push('Sunglasses', 'Wide-brim hat', 'Sunscreen');
    suggestions.tips.push('🔥 Very hot! Wear light, breathable clothing.');
    suggestions.layers = 1;
  }
  
  // Condition-based suggestions
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    suggestions.accessories.push('Umbrella', 'Waterproof jacket', 'Rain boots');
    suggestions.tips.push('☔ Rain expected - bring waterproof gear!');
  }
  
  if (condition === 'Snow') {
    suggestions.accessories.push('Waterproof boots', 'Waterproof gloves');
    suggestions.tips.push('❄️ Snowy conditions - wear waterproof footwear.');
  }
  
  if (windSpeed > 20) {
    suggestions.tips.push('💨 Windy conditions - secure loose clothing and accessories.');
    suggestions.accessories.push('Hair tie or clips');
  }
  
  if (humidity > 80) {
    suggestions.tips.push('💧 High humidity - choose breathable fabrics.');
  }
  
  if (condition === 'Clear' && temp > 20) {
    suggestions.accessories.push('Sunglasses', 'Sunscreen');
    suggestions.tips.push('😎 Sunny day - protect yourself from UV rays.');
  }
  
  return suggestions;
};
