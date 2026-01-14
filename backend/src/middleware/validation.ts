import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  
  next();
};

/**
 * Validation rules for user signup
 */
export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for try-on request
 */
export const validateTryOn = [
  body('modelImage')
    .notEmpty()
    .withMessage('Model image is required')
    .custom((value) => {
      // Check if it's a valid base64 image
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
      if (!base64Regex.test(value)) {
        throw new Error('Model image must be a valid base64 encoded image');
      }
      return true;
    }),
  body('outfitImage')
    .notEmpty()
    .withMessage('Outfit image is required')
    .custom((value) => {
      // Check if it's a valid base64 image
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
      if (!base64Regex.test(value)) {
        throw new Error('Outfit image must be a valid base64 encoded image');
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Validation rules for stylist request
 */
export const validateStylist = [
  body('query')
    .notEmpty()
    .isLength({ min: 5, max: 500 })
    .withMessage('Query must be between 5 and 500 characters'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  body('context.age')
    .optional()
    .isInt({ min: 13, max: 100 })
    .withMessage('Age must be between 13 and 100'),
  body('context.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  handleValidationErrors
];