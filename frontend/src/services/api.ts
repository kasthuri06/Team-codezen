import api from '../config/api';
import { 
  LoginCredentials, 
  SignupCredentials, 
  TryOnRequest, 
  TryOnResponse,
  StylistRequest,
  StylistResponse,
  ApiResponse 
} from '../types';

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * User signup
   */
  signup: async (credentials: SignupCredentials) => {
    const response = await api.post<ApiResponse>('/auth/signup', credentials);
    return response.data;
  },

  /**
   * User login
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<ApiResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get<ApiResponse>('/auth/profile');
    return response.data;
  }
};

/**
 * Virtual Try-On API calls
 */
export const tryOnAPI = {
  /**
   * Generate virtual try-on image
   */
  generateTryOn: async (request: TryOnRequest) => {
    const response = await api.post<ApiResponse<TryOnResponse>>('/tryon', request);
    return response.data;
  },

  /**
   * Get user's try-on history
   */
  getHistory: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get<ApiResponse>('/tryon/history', { params });
    return response.data;
  },

  /**
   * Get specific try-on result
   */
  getTryOnResult: async (id: string) => {
    const response = await api.get<ApiResponse>(`/tryon/${id}`);
    return response.data;
  }
};

/**
 * AI Stylist API calls
 */
export const stylistAPI = {
  /**
   * Get style suggestions
   */
  getSuggestions: async (request: StylistRequest) => {
    const response = await api.post<ApiResponse<StylistResponse>>('/stylist', request);
    return response.data;
  },

  /**
   * Get stylist conversation history
   */
  getHistory: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get<ApiResponse>('/stylist/history', { params });
    return response.data;
  },

  /**
   * Submit feedback on stylist suggestions
   */
  submitFeedback: async (conversationId: string, rating: number, feedback?: string) => {
    const response = await api.post<ApiResponse>('/stylist/feedback', {
      conversationId,
      rating,
      feedback
    });
    return response.data;
  },

  /**
   * Get popular style suggestions
   */
  getPopularSuggestions: async () => {
    const response = await api.get<ApiResponse>('/stylist/suggestions/popular');
    return response.data;
  }
};

/**
 * Generic API error handler
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};