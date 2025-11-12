import { Router, Request, Response } from 'express';
import { getContractStatus } from '../services/contract/contract.service';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const contractStatus = getContractStatus();
    
    res.json({
      success: true,
      message: 'Authentify Backend is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        contract: contractStatus,
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

export default router;