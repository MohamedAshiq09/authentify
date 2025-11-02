import { Request, Response } from 'express';
import { SDKService } from '../services/sdk/sdk.service';
import { AnalyticsService } from '../services/sdk/analytics.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class SDKController {
  /**
   * Create new SDK client
   */
  static async createClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { app_name, app_url, redirect_uris } = req.body;

      const client = await SDKService.createClient({
        app_name,
        app_url,
        redirect_uris,
        created_by: req.user.userId,
      });

      return ResponseUtil.success(res, { client }, 'SDK client created successfully', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get user's SDK clients
   */
  static async getUserClients(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const clients = await SDKService.getUserClients(req.user.userId);

      return ResponseUtil.success(res, { clients });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get SDK client details
   */
  static async getClient(req: Request, res: Response) {
    try {
      const { client_id } = req.params;

      const client = await SDKService.getClient(client_id);
      if (!client) {
        return ResponseUtil.notFound(res, 'SDK client not found');
      }

      // Don't expose client_secret in response
      const { client_secret, ...clientData } = client;

      return ResponseUtil.success(res, { client: clientData });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Update SDK client
   */
  static async updateClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { client_id } = req.params;
      const { app_name, app_url, redirect_uris } = req.body;

      const client = await SDKService.updateClient(client_id, req.user.userId, {
        app_name,
        app_url,
        redirect_uris,
      });

      return ResponseUtil.success(res, { client }, 'SDK client updated successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Delete SDK client
   */
  static async deleteClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { client_id } = req.params;

      await SDKService.deleteClient(client_id, req.user.userId);

      return ResponseUtil.success(res, null, 'SDK client deleted successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Regenerate client secret
   */
  static async regenerateSecret(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { client_id } = req.params;

      const result = await SDKService.regenerateSecret(client_id, req.user.userId);

      return ResponseUtil.success(res, result, 'Client secret regenerated successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Verify client credentials
   */
  static async verifyClient(req: Request, res: Response) {
    try {
      const { client_id, client_secret } = req.body;

      const client = await SDKService.verifyClient(client_id, client_secret);
      if (!client) {
        return ResponseUtil.unauthorized(res, 'Invalid client credentials');
      }

      return ResponseUtil.success(res, { valid: true, client_id: client.client_id });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get client analytics
   */
  static async getClientAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { client_id } = req.params;
      const { start_date, end_date } = req.query;

      // Verify client ownership
      const client = await SDKService.getClient(client_id);
      if (!client || client.created_by !== req.user.userId) {
        return ResponseUtil.forbidden(res, 'Access denied to this client');
      }

      const analytics = await AnalyticsService.getClientAnalytics(
        client_id,
        start_date as string,
        end_date as string
      );

      return ResponseUtil.success(res, { analytics });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get global analytics (admin only)
   */
  static async getGlobalAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      // TODO: Add admin check
      // if (!req.user.isAdmin) {
      //   return ResponseUtil.forbidden(res, 'Admin access required');
      // }

      const { start_date, end_date } = req.query;

      const analytics = await AnalyticsService.getGlobalAnalytics(
        start_date as string,
        end_date as string
      );

      return ResponseUtil.success(res, { analytics });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get client rate limit status
   */
  static async getRateLimit(req: Request, res: Response) {
    try {
      const { client_id } = req.params;

      const rateLimit = await AnalyticsService.getClientRateLimit(client_id);

      return ResponseUtil.success(res, { rateLimit });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }
}