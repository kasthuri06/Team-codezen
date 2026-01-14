/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_QUERY_LENGTH: 500,
  MIN_QUERY_LENGTH: 5
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  TRYON_RESULTS: 'tryon_results',
  STYLIST_HISTORY: 'stylist_history',
  FEEDBACK: 'feedback'
};

// Response Messages
export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    TRYON_GENERATED: 'Virtual try-on generated successfully',
    STYLIST_RESPONSE: 'Style suggestions generated successfully',
    PROFILE_UPDATED: 'Profile updated successfully'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email address is already in use',
    WEAK_PASSWORD: 'Password should be at least 6 characters long',
    INVALID_EMAIL: 'Invalid email address',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_IMAGE: 'Invalid image format or size',
    API_KEY_MISSING: 'API key not configured',
    QUOTA_EXCEEDED: 'API quota exceeded',
    NETWORK_ERROR: 'Network error occurred'
  }
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Rate Limiting
export const RATE_LIMITS = {
  TRYON_PER_HOUR: 10,
  STYLIST_PER_HOUR: 20,
  AUTH_PER_MINUTE: 5
};