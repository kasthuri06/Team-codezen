// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface SignupRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
  token: string;
}

// Try-on types
export interface TryOnRequest {
  modelImage: string; // Base64 encoded image
  outfitImage: string; // Base64 encoded image
  userId: string;
}

export interface TryOnResponse {
  success: boolean;
  generatedImageUrl?: string;
  message: string;
  requestId?: string;
}

export interface TryOnResult {
  id: string;
  userId: string;
  modelImageUrl: string;
  outfitImageUrl: string;
  generatedImageUrl: string;
  createdAt: Date;
  status: 'processing' | 'completed' | 'failed';
}

// Stylist types
export interface StylistRequest {
  query: string;
  userId: string;
  context?: {
    age?: number;
    gender?: string;
    style_preference?: string;
    occasion?: string;
  };
}

export interface StylistResponse {
  success: boolean;
  suggestions: string;
  message: string;
}

export interface StylistHistory {
  id: string;
  userId: string;
  query: string;
  response: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// Miragic API types
export interface MiragicApiResponse {
  success: boolean;
  image_url?: string;
  message: string;
  request_id?: string;
}

// Gemini API types
export interface GeminiApiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}