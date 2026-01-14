# SitFit - AI-Powered Virtual Try-On & Fashion Assistant

SitFit is a comprehensive fashion technology platform that combines AI-powered virtual try-on, intelligent style recommendations, and outfit management features to revolutionize the online shopping experience.

## 🌟 Features

### 1. **AI Virtual Try-On**
- Real-time virtual try-on using Miragic AI API
- Support for full-body and combination (top + bottom) outfits
- High-quality image processing and generation
- Save, share, and download try-on results
- Credit-based system with premium subscriptions

### 2. **Local Virtual Try-On**
- Match uploaded photos with pre-loaded outfit combinations
- Drag-and-drop image upload
- Add custom combinations directly in the app
- Manage and organize outfit collections
- Favorite combinations for quick access

### 3. **AI Stylist Assistant**
- Powered by Google Gemini AI
- Personalized style recommendations
- Context-aware fashion advice
- Conversation history tracking
- Suggested questions for inspiration

### 4. **Outfit Calendar**
- Plan outfits for upcoming events
- Weather-integrated suggestions
- Visual calendar interface
- Save and manage outfit schedules

### 5. **User Profile & History**
- Track try-on history
- View stylist consultations
- Manage favorite looks
- Profile customization
- Activity statistics

### 6. **Premium Subscription**
- Razorpay payment integration
- Credit-based try-on system
- 2 free credits per month
- Premium plans for unlimited access
- Secure payment processing

## 🚀 Quick Start 
### 1. Install Dependencies
```bash
# Install all dependencies (frontend + backend + root)
npm run install-all

# Or install individually:
cd frontend && npm install
cd ../backend && npm install
cd .. && npm install
```

### 2. Environment Setup

**Backend Environment (`backend/.env`):**
```env
PORT=5000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email@your_project.iam.gserviceaccount.com

# API Keys
MIRAGIC_API_KEY=your_miragic_api_key
GEMINI_API_KEY=your_gemini_api_key

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Weather API (optional)
WEATHER_API_KEY=your_weather_api_key
```

**Frontend Environment (`frontend/.env`):**
```env
# Firebase Client SDK
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Razorpay (for payments)
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run the Application

**Option 1: Run Both Together**
```bash
npm run dev
```

**Option 2: Run Separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🔧 Troubleshooting

### API Keys Not Loading
If you see warnings about missing API keys:

1. **Check .env file format** - No commas, no extra quotes:
   ```env
   MIRAGIC_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

2. **Restart the server** after changing .env files

3. **Verify file location** - .env files should be in:
   - `backend/.env` (for backend variables)
   - `frontend/.env` (for frontend variables)

### Build Issues
```bash
# Clean and rebuild
cd backend && rm -rf dist && npm run build
cd ../frontend && rm -rf build && npm run build
```

### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure
```
sitfit/
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout.tsx     # Main layout wrapper
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── CreditBadge.tsx
│   │   │   └── UpgradeModal.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx  # User dashboard
│   │   │   ├── TryOn.tsx      # AI virtual try-on
│   │   │   ├── LocalTryOn.tsx # Local outfit matching
│   │   │   ├── Stylist.tsx    # AI stylist chat
│   │   │   ├── OutfitCalendar.tsx
│   │   │   ├── Profile.tsx    # User profile & history
│   │   │   ├── Subscription.tsx
│   │   │   └── Auth.tsx       # Login/Signup
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/          # API services
│   │   │   ├── outfitMatcher.ts
│   │   │   ├── creditService.ts
│   │   │   ├── downloadService.ts
│   │   │   ├── weatherService.ts
│   │   │   └── calendarService.ts
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   └── config/            # Configuration
│   │       ├── api.ts         # Axios configuration
│   │       └── firebase.ts    # Firebase config
│   ├── public/
│   │   └── outfit-data/       # Local outfit combinations
│   └── package.json
├── backend/                   # Node.js Express backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── tryon.ts       # Virtual try-on
│   │   │   ├── stylist.ts     # AI stylist
│   │   │   ├── payment.ts     # Razorpay integration
│   │   │   └── weather.ts     # Weather API
│   │   ├── services/          # Business logic
│   │   │   ├── miragicService.ts   # Miragic API
│   │   │   ├── geminiService.ts    # Gemini AI
│   │   │   ├── firestoreService.ts # Database
│   │   │   ├── razorpayService.ts  # Payments
│   │   │   └── weatherService.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT verification
│   │   │   ├── validation.ts  # Input validation
│   │   │   └── errorHandler.ts
│   │   ├── config/            # Configuration
│   │   │   └── firebase.ts    # Firebase Admin
│   │   ├── types/             # TypeScript types
│   │   └── server.ts          # Express app
│   └── package.json
├── README.md
├── SETUP.md                   # Detailed setup guide
├── SUBSCRIPTION-SETUP.md      # Payment setup guide
└── package.json               # Root package.json
```

## 🎯 Features

### ✅ Implemented
- **User Authentication**: Firebase Auth with email/password
- **AI Virtual Try-On**: Miragic API integration with job polling
- **Local Try-On**: Offline outfit matching with custom combinations
- **AI Stylist**: Gemini AI-powered fashion consultation
- **Outfit Calendar**: Weather-integrated outfit planning
- **Credit System**: Free and premium credit management
- **Payment Integration**: Razorpay for subscriptions
- **Profile Management**: User history, favorites, and settings
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark Theme**: Purple and pink gradient design
- **Image Management**: Upload, download, and share features

### 🔄 API Integration
- **Miragic API**: Virtual try-on with SINGLE and COMB modes
- **Gemini AI**: Natural language style recommendations
- **Firebase**: Authentication, Firestore database
- **Razorpay**: Secure payment processing
- **Weather API**: Location-based weather data

### 🎨 UI/UX Features
- Modern gradient design (purple/pink theme)
- Smooth animations and transitions
- Loading states with spinners
- Toast notifications for feedback
- Drag-and-drop image upload
- Modal dialogs for actions
- Hover effects with purple accents
- Black backgrounds with purple borders

## 🛠️ Development

### Available Scripts

**Root Level:**
- `npm run dev` - Start both frontend and backend
- `npm run install-all` - Install all dependencies
- `npm run build` - Build frontend for production

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### API Endpoints

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

**Virtual Try-On:**
- `POST /api/tryon` - Generate AI virtual try-on (requires auth)
- `GET /api/tryon/history` - Get user's try-on history

**AI Stylist:**
- `POST /api/stylist` - Get AI style suggestions (requires auth)
- `GET /api/stylist/history` - Get consultation history

**Payments:**
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature
- `GET /api/payment/credits/:userId` - Get user credits

**Weather:**
- `GET /api/weather?location=city` - Get weather data

**Health Check:**
- `GET /health` - Server health status

## 🔐 Security Features
- JWT token authentication with Firebase
- Input validation and sanitization
- CORS protection with allowed origins
- Helmet security headers
- Environment variable protection
- Secure payment processing with Razorpay
- Rate limiting on API endpoints
- XSS protection
- SQL injection prevention

## 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized layouts
- Touch-friendly interface
- Adaptive image sizing
- Responsive navigation
- Progressive Web App ready

## 💳 Payment & Credits
- **Free Tier**: 2 credits per month
- **Premium Plans**: Unlimited try-ons
- **Razorpay Integration**: Secure payments
- **Test Mode**: Use test cards for development
- **Credit Badge**: Real-time credit display
- **Auto-deduction**: Credits deducted per try-on

## 🎨 Design System
- **Primary Colors**: Purple (#9013FE) and Pink gradients
- **Backgrounds**: Black with purple borders
- **Hover Effects**: Light purple (hover:bg-purple-50)
- **Buttons**: Gradient purple-to-pink
- **Cards**: White with shadow and hover effects
- **Typography**: Clean, modern fonts
- **Icons**: Heroicons library

## 🚀 Production Deployment

### Build for Production
```bash
# Build frontend
cd frontend
npm run build
# Output: frontend/build/

# Build backend
cd backend
npm run build
# Output: backend/dist/
```

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
PORT=5000
# Use production Firebase credentials
# Use production API keys
# Configure production CORS origins

# Frontend
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
# Use production Firebase config
# Use production Razorpay keys
```

### Deployment Checklist
- [ ] Set all environment variables
- [ ] Build frontend and backend
- [ ] Configure CORS for production domain
- [ ] Set up SSL certificates
- [ ] Configure Firebase security rules
- [ ] Test payment integration
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up database backups

## 🐛 Known Issues & Solutions

### Virtual Try-On Timeout
If try-on generation times out:
- Increase timeout in `frontend/src/config/api.ts` (currently 60s)
- Check Miragic API credits
- Verify network connectivity

### Image Not Displaying
- Check browser console for CORS errors
- Verify image URL is accessible
- Check Miragic API response format

### Payment Issues
- Verify Razorpay keys are correct
- Check test mode vs live mode
- Ensure webhook URLs are configured

## 📚 Additional Documentation
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [SUBSCRIPTION-SETUP.md](SUBSCRIPTION-SETUP.md) - Payment integration guide
- [LOCAL-TRYON-GUIDE.md](LOCAL-TRYON-GUIDE.md) - Local try-on feature guide

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- React Hot Toast for notifications
- Heroicons for icons
- Firebase SDK for auth

**Backend:**
- Node.js with Express
- TypeScript
- Firebase Admin SDK
- Axios for external APIs
- Helmet for security
- CORS middleware
- Concurrently for dev mode

**External Services:**
- Miragic AI (Virtual Try-On)
- Google Gemini AI (Style Assistant)
- Firebase (Auth & Database)
- Razorpay (Payments)
- Weather API (Optional)

## 📄 License
MIT License - feel free to use this project for learning and development.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors
- Your Name - Initial work

## 🙏 Acknowledgments
- Miragic AI for virtual try-on technology
- Google Gemini for AI assistance
- Firebase for backend infrastructure
- Razorpay for payment processing

## 📞 Support
For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Made with ❤️ using React, TypeScript, and AI**