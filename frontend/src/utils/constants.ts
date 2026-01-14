/**
 * Frontend application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
};

// UI Constants
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  LOADING_DELAY: 300,
  DEBOUNCE_DELAY: 500,
  MAX_QUERY_LENGTH: 500,
  MIN_QUERY_LENGTH: 5
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  TRYON: '/tryon',
  STYLIST: '/stylist',
  PROFILE: '/profile'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'sitfit_user_preferences',
  THEME: 'sitfit_theme',
  LANGUAGE: 'sitfit_language'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size must be less than 10MB.',
  INVALID_FILE_TYPE: 'Please select a valid image file (JPEG, PNG, GIF).',
  QUERY_TOO_SHORT: 'Please provide a more detailed question (at least 5 characters).',
  QUERY_TOO_LONG: 'Question is too long. Please keep it under 500 characters.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TRYON_SUCCESS: 'Virtual try-on generated successfully!',
  STYLIST_SUCCESS: 'Got your style suggestions!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  IMAGE_REMOVED: 'Image removed',
  PROFILE_UPDATED: 'Profile updated successfully!'
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === 'production',
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production'
};

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#0ea5e9',
    SECONDARY: '#d946ef',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6'
  }
};