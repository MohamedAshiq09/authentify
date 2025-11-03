import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseUtil.error(res, 'Validation failed', 400, errors.array());
  }
  next();
};

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('wallet_address')
    .optional()
    .matches(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)
    .withMessage('Invalid Substrate address'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateSDKClient = [
  body('app_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('App name is required (1-100 characters)'),
  body('app_url')
    .optional()
    .isURL()
    .withMessage('Valid URL is required'),
  body('redirect_uris')
    .isArray({ min: 1 })
    .withMessage('At least one redirect URI is required'),
  body('redirect_uris.*')
    .isURL()
    .withMessage('All redirect URIs must be valid URLs'),
  handleValidationErrors,
];