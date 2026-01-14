import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { validateTryOn } from '../middleware/validation';
import miragicService from '../services/miragicService';
import firestoreService from '../services/firestoreService';
import { TryOnRequest, TryOnResponse } from '../types';

const router = Router();

/**
 * POST /api/tryon
 * Generate virtual try-on image using Miragic API
 * Requires authentication
 */
router.post('/', verifyToken, validateTryOn, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      modelImage, 
      outfitImage, 
      garmentType = 'full_body',
      bottomClothImage 
    }: TryOnRequest & { 
      garmentType?: 'full_body' | 'comb';
      bottomClothImage?: string;
    } = req.body;
    const userId = req.user!.uid;

    // Validate image formats and sizes
    if (!miragicService.validateImage(modelImage)) {
      res.status(400).json({
        success: false,
        message: 'Invalid model image format or size. Please use JPEG/PNG under 10MB.'
      });
      return;
    }

    if (!miragicService.validateImage(outfitImage)) {
      res.status(400).json({
        success: false,
        message: 'Invalid outfit image format or size. Please use JPEG/PNG under 10MB.'
      });
      return;
    }

    // Validate bottom cloth image if provided for combination try-on
    if (garmentType === 'comb' && bottomClothImage && !miragicService.validateImage(bottomClothImage)) {
      res.status(400).json({
        success: false,
        message: 'Invalid bottom cloth image format or size. Please use JPEG/PNG under 10MB.'
      });
      return;
    }

    // Save initial try-on request to database
    const tryonResultId = await firestoreService.saveTryOnResult({
      userId,
      modelImageUrl: 'data:image/jpeg;base64,...', // In production, you'd upload to cloud storage
      outfitImageUrl: 'data:image/jpeg;base64,...',
      generatedImageUrl: '',
      status: 'processing',
      createdAt: new Date()
    });

    // Call Miragic API to generate try-on image
    const miragicResponse = await miragicService.generateTryOn(
      modelImage, 
      outfitImage, 
      garmentType,
      bottomClothImage
    );

    if (miragicResponse.success && miragicResponse.image_url) {
      // Update database with successful result
      await firestoreService.updateTryOnResult(
        tryonResultId,
        'completed',
        miragicResponse.image_url
      );

      const response: TryOnResponse = {
        success: true,
        generatedImageUrl: miragicResponse.image_url,
        message: miragicResponse.message || 'Virtual try-on generated successfully!',
        requestId: miragicResponse.request_id
      };

      console.log('🎉 Sending successful response to frontend:', {
        success: true,
        generatedImageUrl: response.generatedImageUrl,
        message: response.message
      });

      res.status(200).json({
        success: true,
        message: 'Try-on generated successfully',
        data: response
      });

    } else {
      console.log('❌ Miragic response failed:', miragicResponse);
      // Update database with failed result
      await firestoreService.updateTryOnResult(tryonResultId, 'failed');

      res.status(500).json({
        success: false,
        message: miragicResponse.message || 'Failed to generate try-on image'
      });
    }

  } catch (error: any) {
    console.error('Try-on generation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during try-on generation',
      error: error.message
    });
  }
});

/**
 * GET /api/tryon/history
 * Get user's try-on history
 * Requires authentication
 */
router.get('/history', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await firestoreService.getUserTryOnHistory(userId, limit);

    res.status(200).json({
      success: true,
      message: 'Try-on history retrieved successfully',
      data: {
        history,
        count: history.length
      }
    });

  } catch (error: any) {
    console.error('Try-on history error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get try-on history',
      error: error.message
    });
  }
});

/**
 * GET /api/tryon/:id
 * Get specific try-on result by ID
 * Requires authentication
 */
router.get('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    // In a real implementation, you'd fetch the specific try-on result
    // and verify it belongs to the authenticated user
    
    res.status(200).json({
      success: true,
      message: 'Try-on result retrieved successfully',
      data: {
        id,
        message: 'This endpoint would return specific try-on result details'
      }
    });

  } catch (error: any) {
    console.error('Try-on result error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get try-on result',
      error: error.message
    });
  }
});

export default router;