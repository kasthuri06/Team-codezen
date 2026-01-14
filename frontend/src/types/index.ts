// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName?: string;
}

// Try-on types
export interface TryOnRequest {
  modelImage: string;
  outfitImage: string;
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

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

// Image upload types
export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current?: boolean;
}