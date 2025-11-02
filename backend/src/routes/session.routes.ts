import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/ratelimit.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();

// Token refresh
router.post('/refresh',
  authLimiter,
  [
    body('refresh_token').notEmpty().withMessage('Refresh token is required'),
    handleValidationErrors,
  ],
  SessionController.refreshToken
);

// Logout
router.post('/logout',
  [
    body('refresh_token').notEmpty().withMessage('Refresh token is required'),
    handleValidationErrors,
  ],
  SessionController.logout
);

// Protected routes
router.post('/logout-all', authenticateToken, SessionController.logoutAll);
router.get('/sessions', authenticateToken, SessionController.getSessions);
router.get('/validate', authenticateToken, SessionController.validateSession);

export default router;