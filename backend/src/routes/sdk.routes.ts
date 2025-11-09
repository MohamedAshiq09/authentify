import { Router } from 'express';
import { SDKController } from '../controllers/sdk.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generalLimiter, authLimiter } from '../middleware/ratelimit.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// SDK Health Check
router.get('/health', generalLimiter, SDKController.health);

// Authentication SDK Routes
router.post('/auth/register-complete',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').optional().trim().isLength({ min: 1 }).withMessage('Username is required for biometric'),
    body('enable_biometric').optional().isBoolean().withMessage('Enable biometric must be boolean'),
    body('wallet_address').optional().matches(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/).withMessage('Invalid wallet address'),
    handleValidationErrors,
  ],
  SDKController.registerComplete
);

router.post('/auth/authenticate-complete',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').optional().notEmpty().withMessage('Password cannot be empty'),
    body('biometric_assertion').optional().isObject().withMessage('Invalid biometric assertion'),
    handleValidationErrors,
  ],
  SDKController.authenticateComplete
);

router.get('/auth/methods',
  generalLimiter,
  [
    query('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    handleValidationErrors,
  ],
  SDKController.getAuthMethods
);

router.get('/profile', authenticateToken, SDKController.getProfile);

router.post('/biometric/enable',
  authenticateToken,
  [
    body('username').optional().trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('authenticator_type').optional().isIn(['platform', 'cross-platform']).withMessage('Invalid authenticator type'),
    handleValidationErrors,
  ],
  SDKController.enableBiometric
);

router.post('/sessions/revoke-all', authenticateToken, SDKController.revokeAllSessions);

// Note: Original SDK client management routes removed
// This SDK now focuses on authentication services

export default router;