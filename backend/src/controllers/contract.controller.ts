import { Request, Response } from 'express';
import { ContractService } from '../services/contract/contract.service';
import { EventsService } from '../services/contract/events.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ContractController {
  /**
   * Register user on smart contract
   */
  static async registerUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { user_address, auth_method } = req.body;

      const result = await ContractService.registerUser({
        user_address,
        auth_method,
      });

      return ResponseUtil.success(res, result, 'User registered on contract successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Check if user can login
   */
  static async canUserLogin(req: Request, res: Response) {
    try {
      const { user_address } = req.params;

      const result = await ContractService.canUserLogin({ user_address });

      return ResponseUtil.success(res, result);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get user's authentication methods
   */
  static async getUserAuthMethods(req: Request, res: Response) {
    try {
      const { user_address } = req.params;

      const authMethods = await ContractService.getUserAuthMethods(user_address);

      return ResponseUtil.success(res, { authMethods });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get user's contract events
   */
  static async getUserEvents(req: Request, res: Response) {
    try {
      const { user_address } = req.params;

      const events = await ContractService.getUserContractEvents(user_address);

      return ResponseUtil.success(res, { events });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Sync contract events from blockchain
   */
  static async syncEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await ContractService.syncContractEvents();

      return ResponseUtil.success(res, result, 'Events synced successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get recent contract events
   */
  static async getRecentEvents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const events = await EventsService.getRecentEvents(limit);

      return ResponseUtil.success(res, { events });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get events by transaction hash
   */
  static async getEventsByTransaction(req: Request, res: Response) {
    try {
      const { transaction_hash } = req.params;

      const events = await EventsService.getEventsByTransaction(transaction_hash);

      return ResponseUtil.success(res, { events });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get event listener status
   */
  static async getListenerStatus(req: Request, res: Response) {
    try {
      const status = EventsService.getListenerStatus();

      return ResponseUtil.success(res, status);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Start event listener
   */
  static async startListener(req: AuthenticatedRequest, res: Response) {
    try {
      EventsService.startEventListener();

      return ResponseUtil.success(res, null, 'Event listener started');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Stop event listener
   */
  static async stopListener(req: AuthenticatedRequest, res: Response) {
    try {
      EventsService.stopEventListener();

      return ResponseUtil.success(res, null, 'Event listener stopped');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }
}