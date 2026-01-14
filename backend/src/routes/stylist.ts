import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { validateStylist } from '../middleware/validation';
import geminiService from '../services/geminiService';
import firestoreService from '../services/firestoreService';
import { StylistRequest, StylistResponse } from '../types';

const router = Router();

/**
 * POST /api/stylist
 * Get AI style suggestions using Gemini API
 * Requires authentication
 */
router.post('/', verifyToken, validateStylist, async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, context }: StylistRequest = req.body;
    const userId = req.user!.uid;

    // Validate query
    if (!geminiService.validateQuery(query)) {
      res.status(400).json({
        success: false,
        message: 'Invalid query. Please provide a question between 5 and 500 characters.'
      });
      return;
    }

    // Prepare request for Gemini API
    const stylistRequest: StylistRequest = {
      query,
      userId,
      context: context || {}
    };

    // Get AI suggestions from Gemini
    const suggestions = await geminiService.getStyleSuggestions(stylistRequest);

    // Save conversation to database
    await firestoreService.saveStylistHistory({
      userId,
      query,
      response: suggestions,
      createdAt: new Date()
    });

    const response: StylistResponse = {
      success: true,
      suggestions,
      message: 'Style suggestions generated successfully!'
    };

    res.status(200).json({
      success: true,
      message: 'Style suggestions retrieved successfully',
      data: response
    });

  } catch (error: any) {
    console.error('Stylist error:', error);
    
    let message = 'Failed to generate style suggestions';
    let statusCode = 500;

    if (error.message.includes('API key not configured')) {
      message = 'AI stylist service is currently unavailable';
      statusCode = 503;
    } else if (error.message.includes('quota')) {
      message = 'AI stylist service is temporarily unavailable due to high demand';
      statusCode = 429;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message
    });
  }
});

/**
 * GET /api/stylist/history
 * Get user's stylist conversation history
 * Requires authentication
 */
router.get('/history', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await firestoreService.getUserStylistHistory(userId, limit);

    res.status(200).json({
      success: true,
      message: 'Stylist history retrieved successfully',
      data: {
        history,
        count: history.length
      }
    });

  } catch (error: any) {
    console.error('Stylist history error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get stylist history',
      error: error.message
    });
  }
});

/**
 * POST /api/stylist/feedback
 * Submit feedback on AI stylist suggestions
 * Requires authentication
 */
router.post('/feedback', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId, rating, feedback } = req.body;
    const userId = req.user!.uid;

    // Validate input
    if (!conversationId || !rating) {
      res.status(400).json({
        success: false,
        message: 'Conversation ID and rating are required'
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    // In a real implementation, you'd save the feedback to the database
    // For now, we'll just log it
    console.log('Stylist feedback received:', {
      userId,
      conversationId,
      rating,
      feedback,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback! It helps us improve our AI stylist.'
    });

  } catch (error: any) {
    console.error('Stylist feedback error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

/**
 * GET /api/stylist/suggestions/popular
 * Get popular style suggestions and trends
 */
router.get('/suggestions/popular', async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, you'd fetch popular suggestions from the database
    const popularSuggestions = [
      {
        category: 'Casual',
        suggestion: 'Try layering a denim jacket over a basic tee with high-waisted jeans',
        popularity: 95
      },
      {
        category: 'Business',
        suggestion: 'A blazer with tailored trousers and loafers creates a professional look',
        popularity: 88
      },
      {
        category: 'Evening',
        suggestion: 'A little black dress with statement jewelry is always elegant',
        popularity: 92
      },
      {
        category: 'Weekend',
        suggestion: 'Comfortable sneakers with joggers and a cozy sweater for relaxed vibes',
        popularity: 85
      }
    ];

    res.status(200).json({
      success: true,
      message: 'Popular suggestions retrieved successfully',
      data: {
        suggestions: popularSuggestions,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Popular suggestions error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get popular suggestions',
      error: error.message
    });
  }
});

export default router;