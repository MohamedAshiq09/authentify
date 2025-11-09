import { Router } from 'express';
import { body } from 'express-validator';
import { BiometricController } from '../controllers/biometric.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/ratelimit.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// Public routes - Registration
router.post(
  '/registration/options',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('authenticatorType').optional().isIn(['platform', 'cross-platform']).withMessage('Invalid authenticator type'),
    handleValidationErrors,
  ],
  BiometricController.generateRegistrationOptions
);

router.post(
  '/registration/verify',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('attestationResponse').notEmpty().withMessage('Attestation response is required'),
    handleValidationErrors,
  ],
  BiometricController.verifyRegistration
);

// Public routes - Authentication
router.post(
  '/authentication/options',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    handleValidationErrors,
  ],
  BiometricController.generateAuthenticationOptions
);

router.post(
  '/authentication/verify',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('assertionResponse').notEmpty().withMessage('Assertion response is required'),
    handleValidationErrors,
  ],
  BiometricController.verifyAuthentication
);

// Protected routes
router.get('/credentials', authenticateToken, BiometricController.getCredentials);

router.delete('/credentials/:credentialId', authenticateToken, BiometricController.deleteCredential);

export default router;
