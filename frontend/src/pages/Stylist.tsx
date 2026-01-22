import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, ClockIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../config/api';
import { StylistRequest, StylistResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
}

const Stylist: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({
    age: '',
    gender: '',
    style_preference: '',
    occasion: ''
  });

  // Load existing conversations from localStorage
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('sitfit-stylist-history') || '[]');
    const loadedConversations = storedHistory.map((item: any) => ({
      id: item.id,
      query: item.query,
      response: item.response,
      timestamp: new Date(item.createdAt)
    }));
    setConversations(loadedConversations);
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-yellow-700 mb-4">
              Please log in to access the AI Stylist feature and get personalized fashion advice.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a question or request');
      return;
    }

    if (query.trim().length < 5) {
      toast.error('Please provide a more detailed question');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare context (only include non-empty values)
      const requestContext: any = {};
      if (context.age) requestContext.age = parseInt(context.age);
      if (context.gender) requestContext.gender = context.gender;
      if (context.style_preference) requestContext.style_preference = context.style_preference;
      if (context.occasion) requestContext.occasion = context.occasion;

      const request: StylistRequest = {
        query: query.trim(),
        context: Object.keys(requestContext).length > 0 ? requestContext : undefined
      };

      const response = await api.post<{ data: StylistResponse }>('/stylist', request);
      
      if (response.data.data.success) {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          query: query.trim(),
          response: response.data.data.suggestions,
          timestamp: new Date()
        };

        setConversations(prev => [newConversation, ...prev]);
        
        // Save to localStorage for Profile page
        const existingHistory = JSON.parse(localStorage.getItem('sitfit-stylist-history') || '[]');
        const historyItem = {
          id: newConversation.id,
          query: newConversation.query,
          response: newConversation.response,
          createdAt: newConversation.timestamp,
          rating: 5 // Default rating, can be updated later
        };
        existingHistory.unshift(historyItem);
        
        // Keep only last 50 conversations
        if (existingHistory.length > 50) {
          existingHistory.splice(50);
        }
        
        localStorage.setItem('sitfit-stylist-history', JSON.stringify(existingHistory));
        
        setQuery('');
        toast.success('Got your style suggestions!');
      } else {
        toast.error(response.data.data.message || 'Failed to get style suggestions');
      }
    } catch (error: any) {
      console.error('Stylist error:', error);
      
      let errorMessage = 'Failed to get style suggestions';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to use the AI Stylist feature';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please check your account status';
      } else if (error.response?.status === 429) {
        errorMessage = 'AI stylist is busy. Please try again in a moment';
      } else if (error.response?.status === 503) {
        errorMessage = 'AI stylist service is temporarily unavailable';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextChange = (field: string, value: string) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const suggestedQuestions = [
    "What should I wear for a job interview?",
    "Help me style a casual weekend outfit",
    "What colors work best with my skin tone?",
    "How can I dress for a first date?",
    "What's trending in fashion right now?",
    "How do I build a capsule wardrobe?"
  ];

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
      localStorage.removeItem('sitfit-stylist-history');
      setConversations([]);
      toast.success('Conversation history cleared');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-secondary-500 to-purple-500 rounded-full">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Stylist Assistant</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized style advice, outfit suggestions, and fashion tips from our AI stylist
          </p>
        </div>

        {/* Context Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tell me about yourself (optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="13"
                max="100"
                value={context.age}
                onChange={(e) => handleContextChange('age', e.target.value)}
                className="input-field"
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={context.gender}
                onChange={(e) => handleContextChange('gender', e.target.value)}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style Preference
              </label>
              <input
                type="text"
                value={context.style_preference}
                onChange={(e) => handleContextChange('style_preference', e.target.value)}
                className="input-field"
                placeholder="e.g., minimalist, boho"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occasion
              </label>
              <input
                type="text"
                value={context.occasion}
                onChange={(e) => handleContextChange('occasion', e.target.value)}
                className="input-field"
                placeholder="e.g., work, party"
              />
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask your style question
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="e.g., What should I wear for a business meeting? I want to look professional but approachable..."
                disabled={isLoading}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {query.length}/500 characters
                </span>
                <span className="text-xs text-gray-500">
                  Minimum 5 characters required
                </span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || query.trim().length < 5}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Getting suggestions...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    <span>Get Style Advice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Suggested Questions */}
        {conversations.length === 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need inspiration? Try these questions:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-black transition-colors text-sm text-gray-700 hover:text-white group"
                  disabled={isLoading}
                >
                  <span className="group-hover:text-white">"{suggestion}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        {conversations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Style Conversations
              </h2>
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Clear History</span>
              </button>
            </div>
            
            {conversations.map((conversation) => (
              <div key={conversation.id} className="card space-y-4">
                {/* User Question */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">You</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-black border border-purple-300 rounded-lg p-3">
                      <p className="text-white">{conversation.query}</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatTimestamp(conversation.timestamp)}
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-purple-500 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-black border border-purple-300 rounded-lg p-4">
                      <div className="prose prose-sm max-w-none">
                        {conversation.response.split('\n').map((paragraph, index) => (
                          <p key={index} className="text-white mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">💡 Get Better Advice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-purple-800 mb-2">Be Specific:</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Mention the occasion or event</li>
                <li>• Describe your body type or concerns</li>
                <li>• Include your budget range</li>
                <li>• Share your style preferences</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-800 mb-2">Ask About:</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Color combinations and palettes</li>
                <li>• Seasonal fashion trends</li>
                <li>• Outfit coordination tips</li>
                <li>• Shopping recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Stylist;