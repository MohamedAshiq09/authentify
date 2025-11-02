import { Request, Response } from 'express';
import { SessionService } from '../services/session/session.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class SessionController {
  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return ResponseUtil.error(res, 'Refresh token is required');
      }

      const tokens = await SessionService.refreshAccessToken(refresh_token);

      return ResponseUtil.success(res, { tokens }, 'Token refreshed successfully');
    } catch (error: any) {
      return ResponseUtil.unauthorized(res, error.message);
    }
  }

  /**
   * Logout (invalidate session)
   */
  static async logout(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return ResponseUtil.error(res, 'Refresh token is required');
      }

      await SessionService.invalidateSession(refresh_token);

      return ResponseUtil.success(res, null, 'Logged out successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      await SessionService.invalidateAllUserSessions(req.user.userId);

      return ResponseUtil.success(res, null, 'Logged out from all devices');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get user's active sessions
   */
  static async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const sessions = await SessionService.getUserSessions(req.user.userId);

      return ResponseUtil.success(res, { sessions });
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Validate current session
   */
  static async validateSession(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      return ResponseUtil.success(res, {
        valid: true,
        user: req.user,
      }, 'Session is valid');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }
}