import { Request, Response } from 'express';
import { BiometricService } from '../services/auth/biometric.service';
import { AuthService } from '../services/auth/auth.service';
import { ResponseUtil } from '../utils/response.util';
import { JWTUtil } from '../utils/jwt.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class BiometricController {
  /**
   * Generate registration options
   */
  static async generateRegistrationOptions(req: Request, res: Response) {
    try {
      const { email, username, authenticatorType = 'platform' } = req.body;

      if (!email || !username) {
        return ResponseUtil.error(res, 'Email and username are required', 400);
      }

      if (!['platform', 'cross-platform'].includes(authenticatorType)) {
        return ResponseUtil.error(res, 'Invalid authenticator type. Must be "platform" or "cross-platform"', 400);
      }

      const options = await BiometricService.generateRegistrationOptions(email, username, authenticatorType);

      return ResponseUtil.success(res, options, `Registration options generated for ${authenticatorType} authenticator`);
    } catch (error: any) {
      console.error('Generate registration options error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Verify registration response
   */
  static async verifyRegistration(req: Request, res: Response) {
    try {
      const { email, attestationResponse } = req.body;

      if (!email || !attestationResponse) {
        return ResponseUtil.error(res, 'Email and attestation response are required', 400);
      }

      const result = await BiometricService.verifyRegistration(email, attestationResponse);

      if (result.verified) {
        return ResponseUtil.success(
          res,
          { verified: true, credential: result.credential },
          'Biometric credential registered successfully'
        );
      }

      return ResponseUtil.error(res, 'Registration verification failed', 400);
    } catch (error: any) {
      console.error('Verify registration error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Generate authentication options
   */
  static async generateAuthenticationOptions(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return ResponseUtil.error(res, 'Email is required', 400);
      }

      const options = await BiometricService.generateAuthenticationOptions(email);

      return ResponseUtil.success(res, options);
    } catch (error: any) {
      console.error('Generate authentication options error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Verify authentication response and login
   */
  static async verifyAuthentication(req: Request, res: Response) {
    try {
      const { email, assertionResponse } = req.body;

      if (!email || !assertionResponse) {
        return ResponseUtil.error(res, 'Email and assertion response are required', 400);
      }

      const result = await BiometricService.verifyAuthentication(email, assertionResponse);

      if (result.verified && result.user) {
        // Get full user data
        const user = await AuthService.getUserById(result.user.id);

        if (!user) {
          return ResponseUtil.error(res, 'User not found', 404);
        }

        // Generate JWT tokens
        const tokens = JWTUtil.generateTokenPair({ userId: user.id, email: user.email });

        return ResponseUtil.success(
          res,
          {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          'Biometric authentication successful'
        );
      }

      return ResponseUtil.error(res, 'Authentication verification failed', 401);
    } catch (error: any) {
      console.error('Verify authentication error:', error);
      return ResponseUtil.error(res, error.message, 401);
    }
  }

  /**
   * Get user's biometric credentials
   */
  static async getCredentials(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const credentials = await BiometricService.getUserCredentials(req.user.userId);

      return ResponseUtil.success(res, { credentials });
    } catch (error: any) {
      console.error('Get credentials error:', error);
      return ResponseUtil.serverError(res, error.message);
    }
  }

  /**
   * Delete a biometric credential
   */
  static async deleteCredential(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { credentialId } = req.params;

      if (!credentialId) {
        return ResponseUtil.error(res, 'Credential ID is required', 400);
      }

      await BiometricService.deleteCredential(req.user.userId, credentialId);

      return ResponseUtil.success(res, null, 'Credential deleted successfully');
    } catch (error: any) {
      console.error('Delete credential error:', error);
      return ResponseUtil.error(res, error.message, 400);
    }
  }
}
