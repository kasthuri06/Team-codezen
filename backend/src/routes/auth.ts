import { Router, Request, Response } from 'express';
import { getAuth } from '../config/firebase';
import firestoreService from '../services/firestoreService';
import { validateSignup, validateLogin } from '../middleware/validation';
import { SignupRequest, LoginRequest, AuthResponse } from '../types';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user with Firebase Auth
 */
router.post('/signup', validateSignup, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName }: SignupRequest = req.body;

    // Create user with Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: displayName || undefined
    });

    // Create custom token for immediate login
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    // Save user profile to Firestore
    await firestoreService.createUser({
      uid: userRecord.uid,
      email: userRecord.email!,
      displayName: userRecord.displayName || undefined,
      photoURL: userRecord.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response: AuthResponse = {
      user: {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userRecord.displayName || undefined
      },
      token: customToken
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: response
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    let message = 'Failed to create user';
    let statusCode = 500;

    if (error.code === 'auth/email-already-exists') {
      message = 'Email address is already in use';
      statusCode = 400;
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return custom token
 * Note: In a real app, you'd typically handle login on the frontend with Firebase SDK
 * This endpoint is for demonstration purposes
 */
router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: LoginRequest = req.body;

    // Get user by email
    const userRecord = await getAuth().getUserByEmail(email);

    // Create custom token
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    // Get user profile from Firestore
    const userProfile = await firestoreService.getUser(userRecord.uid);

    const response: AuthResponse = {
      user: {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userProfile?.displayName || userRecord.displayName || undefined
      },
      token: customToken
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: response
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    let message = 'Login failed';
    let statusCode = 401;

    if (error.code === 'auth/user-not-found') {
      message = 'User not found';
      statusCode = 404;
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    // This would typically use the verifyToken middleware
    // For now, we'll expect the user ID in headers for demonstration
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID required'
      });
      return;
    }

    const userProfile = await firestoreService.getUser(userId);
    
    if (!userProfile) {
      res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userProfile
    });

  } catch (error: any) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

export default router;