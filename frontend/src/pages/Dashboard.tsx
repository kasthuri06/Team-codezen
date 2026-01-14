import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  SparklesIcon, 
  ChartBarIcon,
  ClockIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeather, WeatherResponse, getWeatherIconUrl } from '../services/weatherService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const data = await getCurrentWeather();
      setWeatherData(data);
    } catch (error) {
      console.error('Failed to load weather:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const quickActions = [
    {
      name: 'Virtual Try-On',
      description: 'Upload photos and see how outfits look on you',
      href: '/tryon',
      icon: CameraIcon,
      color: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-600'
    },
    {
      name: 'Local Try-On',
      description: 'Find matching outfits from local database',
      href: '/local-tryon',
      icon: CameraIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      name: 'AI Stylist',
      description: 'Get personalized style recommendations',
      href: '/stylist',
      icon: SparklesIcon,
      color: 'bg-secondary-500',
      hoverColor: 'hover:bg-secondary-600'
    }
  ];

  const stats = [
    {
      name: 'Try-Ons Created',
      value: '12',
      icon: CameraIcon,
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      name: 'Style Consultations',
      value: '8',
      icon: SparklesIcon,
      change: '+3 this week',
      changeType: 'positive'
    },
    {
      name: 'Favorite Looks',
      value: '5',
      icon: ChartBarIcon,
      change: '+1 this week',
      changeType: 'positive'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'tryon',
      description: 'Created virtual try-on with summer dress',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'stylist',
      description: 'Asked for business casual recommendations',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'tryon',
      description: 'Tried on casual weekend outfit',
      time: '3 days ago',
      status: 'completed'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Fashionista'}! 👋
          </h1>
          <p className="text-primary-100">
            Ready to discover your perfect style? Let's create some amazing looks together.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${action.color} ${action.hoverColor} transition-colors`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <stat.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Weather Widget */}
        {loadingWeather ? (
          <div className="card flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : weatherData ? (
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <CloudIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Today's Weather Outfit
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img 
                      src="/weather-icon.png" 
                      alt={weatherData.weather.description}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(weatherData.weather.temp)}°C
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {weatherData.weather.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Clothing:</h3>
                    <div className="flex flex-wrap gap-2">
                      {weatherData.suggestions.clothing.slice(0, 4).map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {weatherData.suggestions.accessories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Don't Forget:</h3>
                      <div className="flex flex-wrap gap-2">
                        {weatherData.suggestions.accessories.slice(0, 3).map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {weatherData.suggestions.tips.length > 0 && (
                    <div className="bg-white rounded-lg p-3 mt-3">
                      <p className="text-sm text-gray-700">
                        {weatherData.suggestions.tips[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <Link 
                to="/calendar" 
                className="btn-outline text-sm ml-4"
              >
                Plan Week
              </Link>
            </div>
          </div>
        ) : null}

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/profile"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border border-transparent hover:bg-black hover:border-purple-300 transition-colors group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'tryon' ? 'bg-primary-100' : 'bg-secondary-100'
                  }`}>
                    {activity.type === 'tryon' ? (
                      <CameraIcon className={`h-4 w-4 ${
                        activity.type === 'tryon' ? 'text-primary-600' : 'text-secondary-600'
                      }`} />
                    ) : (
                      <SparklesIcon className={`h-4 w-4 ${
                        activity.type === 'tryon' ? 'text-primary-600' : 'text-secondary-600'
                      }`} />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-white">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1">
                    <ClockIcon className="h-3 w-3 text-gray-500 group-hover:text-gray-300 mr-1" />
                    <p className="text-xs text-gray-600 group-hover:text-gray-200">{activity.time}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-black mb-4">💡 Style Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-black">For Better Try-Ons:</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• Use well-lit, clear photos</li>
                <li>• Stand straight with arms at your sides</li>
                <li>• Choose high-quality outfit images</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-black">AI Stylist Works Best When:</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• You describe the occasion</li>
                <li>• You mention your style preferences</li>
                <li>• You ask specific questions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;


  