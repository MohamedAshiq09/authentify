import { Request, Response } from 'express';
import { SDKService } from '../services/sdk/sdk.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * SDK Client Management Controller
 * Handles creation and management of SDK client credentials for developers
 */
export class SDKClientController {
  /**
   * Create a new SDK client (Developer Dashboard)
   * Returns client_id and client_secret for the developer's application
   */
  static async createClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { app_name, app_url, redirect_uris, description } = req.body;

      // Validate required fields
      if (!app_name || !redirect_uris || redirect_uris.length === 0) {
        return ResponseUtil.error(res, 'App name and at least one redirect URI are required', 400);
      }

      // Create SDK client
      const client = await SDKService.createClient({
        app_name,
        app_url,
        redirect_uris,
        created_by: req.user.userId,
      });

      return ResponseUtil.success(res, {
        client_id: client.client_id,
        client_secret: client.client_secret,
        app_name: client.app_name,
        app_url: client.app_url,
        redirect_uris: client.redirect_uris,
        created_at: client.created_at,
      }, 'SDK client created successfully. Save your client_secret securely - it won\'t be shown again!', 201);

    } catch (error: any) {
      console.error('Create SDK client error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Get all SDK clients for the authenticated developer
   */
  static async getClients(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const clients = await SDKService.getUserClients(req.user.userId);

      // Don't expose client_secret in list view
      const sanitizedClients = clients.map(client => ({
        id: client.id,
        client_id: client.client_id,
        app_name: client.app_name,
        app_url: client.app_url,
        redirect_uris: client.redirect_uris,
        created_at: client.created_at,
      }));

      return ResponseUtil.success(res, { clients: sanitizedClients });

    } catch (error: any) {
      console.error('Get SDK clients error:', error);
      return ResponseUtil.serverError(res, error.message);
    }
  }

  /**
   * Get a specific SDK client by ID
   */
  static async getClientById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { client_id } = req.params;
      const client = await SDKService.getClient(client_id);

      if (!client) {
        return ResponseUtil.notFound(res, 'SDK client not found');
      }

      // Verify ownership
      if (client.created_by !== req.user.userId) {
        return ResponseUtil.forbidden(res, 'You do not have access to this SDK client');
      }

      // Don't expose client_secret
      const sanitizedClient = {
        id: client.id,
        client_id: client.client_id,
        app_name: client.app_name,
        app_url: client.app_url,
        redirect_uris: client.redirect_uris,
        created_at: client.created_at,
      };

      return ResponseUtil.success(res, { client: sanitizedClient });

    } catch (error: any) {
      console.error('Get SDK client error:', error);
      return ResponseUtil.serverError(res, error.message);
    }
  }

  /**
   * Update SDK client details
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

      return ResponseUtil.success(res, {
        id: client.id,
        client_id: client.client_id,
        app_name: client.app_name,
        app_url: client.app_url,
        redirect_uris: client.redirect_uris,
      }, 'SDK client updated successfully');

    } catch (error: any) {
      console.error('Update SDK client error:', error);
      return ResponseUtil.error(res, error.message, 400);
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

      return ResponseUtil.success(res, {
        client_secret: result.client_secret,
      }, 'Client secret regenerated successfully. Save it securely - it won\'t be shown again!');

    } catch (error: any) {
      console.error('Regenerate secret error:', error);
      return ResponseUtil.error(res, error.message, 400);
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
      console.error('Delete SDK client error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Verify client credentials (used by SDK)
   */
  static async verifyClient(req: Request, res: Response) {
    try {
      const { client_id, client_secret } = req.body;

      if (!client_id || !client_secret) {
        return ResponseUtil.error(res, 'Client ID and Client Secret are required', 400);
      }

      const client = await SDKService.verifyClient(client_id, client_secret);

      if (!client) {
        return ResponseUtil.unauthorized(res, 'Invalid client credentials');
      }

      return ResponseUtil.success(res, {
        valid: true,
        app_name: client.app_name,
      });

    } catch (error: any) {
      console.error('Verify client error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }
}