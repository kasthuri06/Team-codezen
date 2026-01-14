# SitFit Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for authentication and database)
- Miragic API access (for AI try-on features)

## Installation Steps

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup

#### Backend Environment (.env)
Create `backend/.env` file with:
```
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

# Miragic API
MIRAGIC_API_KEY=your-miragic-api-key
MIRAGIC_API_URL=https://api.miragic.ai

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend Environment (.env)
Create `frontend/.env` file with:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### 4. Start the application
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

### 5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features
- Local Try-On System
- AI-Powered Virtual Try-On
- Style Consultation with AI
- Profile Management
- Favorites and History
- Real-time Activity Tracking

## Troubleshooting
- Make sure all environment variables are set correctly
- Check that Firebase is properly configured
- Verify API keys are valid and have proper permissions