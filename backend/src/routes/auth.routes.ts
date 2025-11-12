import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authLimiter, passwordResetLimiter } from '../middleware/ratelimit.middleware';
import { validateRegister, validateLogin, handleValidationErrors } from '../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);
router.post('/oauth/callback', authLimiter, AuthController.oauthCallback);

// Contract-based authentication routes
router.post('/contract/login',
  authLimiter,
  [
    body('username')
      .isLength({ min: 3, max: 32 })
      .withMessage('Username must be 3-32 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
  ],
  AuthController.contractLogin
);

router.post('/contract/register',
  authLimiter,
  [
    body('username')
      .isLength({ min: 3, max: 32 })
      .withMessage('Username must be 3-32 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('walletAddress')
      .matches(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)
      .withMessage('Invalid Substrate address'),
    body('socialIdHash').notEmpty().withMessage('Social ID hash is required'),
    body('socialProvider').notEmpty().withMessage('Social provider is required'),
    handleValidationErrors,
  ],
  AuthController.contractRegister
);

// Password reset routes
router.post('/password/request-reset', 
  passwordResetLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    handleValidationErrors,
  ],
  AuthController.requestPasswordReset
);

router.post('/password/reset',
  authLimiter,
  [
    body('reset_token').notEmpty().withMessage('Reset token is required'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    handleValidationErrors,
  ],
  AuthController.resetPassword
);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);

router.put('/wallet',
  authenticateToken,
  [
    body('wallet_address')
      .matches(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)
      .withMessage('Invalid Substrate address'),
    handleValidationErrors,
  ],
  AuthController.updateWallet
);

router.put('/password',
  authenticateToken,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    handleValidationErrors,
  ],
  AuthController.changePassword
);

router.delete('/oauth/:provider', authenticateToken, AuthController.unlinkOAuth);

export default router;