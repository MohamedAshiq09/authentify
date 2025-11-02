import { Router } from 'express';
import { SDKController } from '../controllers/sdk.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generalLimiter } from '../middleware/ratelimit.middleware';
import { validateSDKClient } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Public routes
router.post('/verify',
  generalLimiter,
  [
    body('client_id').notEmpty().withMessage('Client ID is required'),
    body('client_secret').notEmpty().withMessage('Client secret is required'),
  ],
  SDKController.verifyClient
);

router.get('/client/:client_id', generalLimiter, SDKController.getClient);
router.get('/client/:client_id/rate-limit', generalLimiter, SDKController.getRateLimit);

// Protected routes
router.post('/clients', authenticateToken, validateSDKClient, SDKController.createClient);
router.get('/clients', authenticateToken, SDKController.getUserClients);

router.put('/client/:client_id',
  authenticateToken,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
    body('app_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('App name must be 1-100 characters'),
    body('app_url')
      .optional()
      .isURL()
      .withMessage('Valid URL is required'),
    body('redirect_uris')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one redirect URI is required'),
    body('redirect_uris.*')
      .optional()
      .isURL()
      .withMessage('All redirect URIs must be valid URLs'),
  ],
  SDKController.updateClient
);

router.delete('/client/:client_id',
  authenticateToken,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
  ],
  SDKController.deleteClient
);

router.post('/client/:client_id/regenerate-secret',
  authenticateToken,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
  ],
  SDKController.regenerateSecret
);

// Analytics routes
router.get('/client/:client_id/analytics',
  authenticateToken,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
  ],
  SDKController.getClientAnalytics
);

router.get('/analytics/global', authenticateToken, SDKController.getGlobalAnalytics);

export default router;