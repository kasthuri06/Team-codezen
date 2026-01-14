import express from 'express';
import { getWeatherByLocation, getWeatherForecast, getWeatherBasedOutfitSuggestions } from '../services/weatherService';

const router = express.Router();

// Get current weather and outfit suggestions
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        message: 'Latitude and longitude are required' 
      });
    }
    
    const weather = await getWeatherByLocation(Number(lat), Number(lon));
    const suggestions = getWeatherBasedOutfitSuggestions(weather);
    
    res.json({
      success: true,
      data: {
        weather,
        suggestions
      }
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message 
    });
  }
});

// Get weather forecast for multiple days
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, days = 7 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        message: 'Latitude and longitude are required' 
      });
    }
    
    const forecast = await getWeatherForecast(
      Number(lat), 
      Number(lon), 
      Number(days)
    );
    
    // Add outfit suggestions for each day
    const forecastWithSuggestions = forecast.map(day => ({
      ...day,
      suggestions: getWeatherBasedOutfitSuggestions({
        temp: day.temp,
        feelsLike: day.temp,
        condition: day.condition,
        description: day.description,
        humidity: 60,
        windSpeed: 5,
        icon: day.icon
      })
    }));
    
    res.json({
      success: true,
      data: forecastWithSuggestions
    });
  } catch (error: any) {
    console.error('Weather forecast error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch weather forecast',
      error: error.message 
    });
  }
});

export default router;
