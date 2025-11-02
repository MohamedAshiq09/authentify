import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generalLimiter } from '../middleware/ratelimit.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Public routes (read-only)
router.get('/user/:user_address/can-login',
  generalLimiter,
  [
    param('user_address')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum address'),
  ],
  ContractController.canUserLogin
);

router.get('/user/:user_address/auth-methods',
  generalLimiter,
  [
    param('user_address')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum address'),
  ],
  ContractController.getUserAuthMethods
);

router.get('/user/:user_address/events',
  generalLimiter,
  [
    param('user_address')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum address'),
  ],
  ContractController.getUserEvents
);

router.get('/events/recent', generalLimiter, ContractController.getRecentEvents);

router.get('/events/transaction/:transaction_hash',
  generalLimiter,
  [
    param('transaction_hash')
      .matches(/^0x[a-fA-F0-9]{64}$/)
      .withMessage('Invalid transaction hash'),
  ],
  ContractController.getEventsByTransaction
);

router.get('/listener/status', ContractController.getListenerStatus);

// Protected routes (write operations)
router.post('/register',
  authenticateToken,
  generalLimiter,
  [
    body('user_address')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum address'),
    body('auth_method')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Auth method is required (1-50 characters)'),
  ],
  ContractController.registerUser
);

router.post('/sync', authenticateToken, ContractController.syncEvents);
router.post('/listener/start', authenticateToken, ContractController.startListener);
router.post('/listener/stop', authenticateToken, ContractController.stopListener);

export default router;