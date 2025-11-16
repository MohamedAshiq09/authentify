import { Router } from 'express';
import { SDKClientController } from '../controllers/sdk-client.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generalLimiter } from '../middleware/ratelimit.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Public route - Verify client credentials (used by SDK)
router.post('/verify',
  generalLimiter,
  [
    body('client_id').notEmpty().withMessage('Client ID is required'),
    body('client_secret').notEmpty().withMessage('Client Secret is required'),
    handleValidationErrors,
  ],
  SDKClientController.verifyClient
);

// Protected routes - Developer dashboard
router.post('/clients',
  authenticateToken,
  generalLimiter,
  [
    body('app_name').trim().isLength({ min: 1, max: 100 }).withMessage('App name is required (1-100 characters)'),
    body('app_url').custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty values
      }
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Valid URL is required');
      }
    }),
    body('redirect_uris').isArray({ min: 1 }).withMessage('At least one redirect URI is required'),
    body('redirect_uris').custom((uris) => {
      if (!Array.isArray(uris)) return false;
      return uris.every(uri => {
        try {
          new URL(uri);
          return true;
        } catch {
          return false;
        }
      });
    }).withMessage('All redirect URIs must be valid URLs'),
    handleValidationErrors,
  ],
  SDKClientController.createClient
);

router.get('/clients',
  authenticateToken,
  generalLimiter,
  SDKClientController.getClients
);

router.get('/analytics',
  authenticateToken,
  generalLimiter,
  SDKClientController.getUserAnalytics
);

router.get('/clients/:client_id',
  authenticateToken,
  generalLimiter,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
    handleValidationErrors,
  ],
  SDKClientController.getClientById
);

router.get('/clients/:client_id/stats',
  authenticateToken,
  generalLimiter,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
    handleValidationErrors,
  ],
  SDKClientController.getClientStats
);

router.put('/clients/:client_id',
  authenticateToken,
  generalLimiter,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
    body('app_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('App name must be 1-100 characters'),
    body('app_url').custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty values
      }
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Valid URL is required');
      }
    }),
    body('redirect_uris').optional().isArray({ min: 1 }).withMessage('At least one redirect URI is required'),
    handleValidationErrors,
  ],
  SDKClientController.updateClient
);

router.post('/clients/:client_id/regenerate-secret',
  authenticateToken,
  generalLimiter,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
    handleValidationErrors,
  ],
  SDKClientController.regenerateSecret
);

router.delete('/clients/:client_id',
  authenticateToken,
  generalLimiter,
  [
    param('client_id').notEmpty().withMessage('Client ID is required'),
    handleValidationErrors,
  ],
  SDKClientController.deleteClient
);

export default router;