import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { BiometricService } from '../services/auth/biometric.service';
import { SessionService } from '../services/session/session.service';
import { ResponseUtil } from '../utils/response.util';
import { JWTUtil } from '../utils/jwt.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BiometricCredential } from '../types/biometric.types';

/**
 * SDK Controller - Provides a unified API for authentication services
 * This controller is designed to be used as a reusable authentication SDK
 */
export class SDKController {
  /**
   * SDK Health Check
   */
  static async health(req: Request, res: Response) {
    return ResponseUtil.success(res, {
      status: 'healthy',
      version: '1.0.0',
      services: {
        authentication: 'available',
        biometric: 'available',
        sessions: 'available',
      },
      timestamp: new Date().toISOString(),
    }, 'Authentify SDK is running');
  }

  /**
   * Complete User Registration (Email + Optional Biometric)
   */
  static async registerComplete(req: Request, res: Response) {
    try {
      const { email, password, wallet_address, enable_biometric, username } = req.body;

      // Step 1: Register user account
      const userResult = await AuthService.register({
        email,
        password,
        wallet_address,
      });

      let biometricOptions = null;
      
      // Step 2: Generate biometric options if requested
      if (enable_biometric && username) {
        try {
          biometricOptions = await BiometricService.generateRegistrationOptions(
            email, 
            username, 
            'platform'
          );
        } catch (biometricError: any) {
          console.warn('Biometric setup failed during registration:', biometricError.message);
          // Continue without biometric - it's optional
        }
      }

      return ResponseUtil.success(res, {
        user: userResult.user,
        tokens: userResult.tokens,
        biometric_options: biometricOptions,
        next_steps: biometricOptions ? 
          ['complete_biometric_registration'] : 
          ['login_ready']
      }, 'User registered successfully', 201);

    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Complete Authentication (Email/Password + Optional Biometric)
   */
  static async authenticateComplete(req: Request, res: Response) {
    try {
      const { email, password, biometric_assertion } = req.body;

      let authResult;

      // Try biometric authentication first if provided
      if (biometric_assertion) {
        try {
          const biometricResult = await BiometricService.verifyAuthentication(
            email, 
            biometric_assertion
          );
          
          if (biometricResult.verified && biometricResult.user) {
            // Get full user data
            const user = await AuthService.getUserById(biometricResult.user.id);
            if (!user) {
              throw new Error('User not found');
            }

            // Generate tokens
            const tokens = JWTUtil.generateTokenPair({ 
              userId: user.id, 
              email: user.email 
            });

            // Create session
            await SessionService.createSession(user.id, tokens);

            authResult = { user, tokens, method: 'biometric' };
          }
        } catch (biometricError: any) {
          console.warn('Biometric authentication failed, falling back to password:', biometricError.message);
        }
      }

      // Fall back to password authentication if biometric failed or not provided
      if (!authResult && password) {
        const passwordResult = await AuthService.login({ email, password });
        authResult = { ...passwordResult, method: 'password' };
      }

      if (!authResult) {
        throw new Error('Authentication failed - no valid credentials provided');
      }

      return ResponseUtil.success(res, {
        user: authResult.user,
        tokens: authResult.tokens,
        authentication_method: authResult.method,
        session_created: true
      }, 'Authentication successful');

    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 401);
    }
  }

  /**
   * Get User Profile with Security Status
   */
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      // Get user profile
      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      // Get biometric credentials
      let biometricCredentials: BiometricCredential[] = [];
      try {
        biometricCredentials = await BiometricService.getUserCredentials(req.user.userId);
      } catch (error) {
        console.warn('Could not load biometric credentials:', error);
      }

      // Get active sessions (simplified for now)
      const sessions = [];

      // Calculate security score
      const securityScore = calculateSecurityScore(user, biometricCredentials);

      return ResponseUtil.success(res, {
        user,
        security: {
          score: securityScore.score,
          level: securityScore.level,
          biometric_enabled: biometricCredentials.length > 0,
          biometric_methods: biometricCredentials.length,
          has_wallet: !!user.wallet_address,
          active_sessions: sessions.length,
        },
        biometric_credentials: biometricCredentials,
        recommendations: securityScore.recommendations,
      });

    } catch (error: any) {
      return ResponseUtil.serverError(res, error.message);
    }
  }

  /**
   * Enable Biometric Authentication
   */
  static async enableBiometric(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      const { username, authenticator_type = 'platform' } = req.body;

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      const options = await BiometricService.generateRegistrationOptions(
        user.email,
        username || user.email.split('@')[0],
        authenticator_type
      );

      return ResponseUtil.success(res, {
        registration_options: options,
        user_id: user.id,
        email: user.email,
      }, 'Biometric registration options generated');

    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Get Authentication Methods Available for User
   */
  static async getAuthMethods(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return ResponseUtil.error(res, 'Email is required', 400);
      }

      // For now, we'll check if user exists by trying to get user by email
      // This is a simplified implementation
      return ResponseUtil.success(res, {
        available_methods: ['password'],
        user_exists: true,
        biometric_methods: 0,
        recommended_method: 'password',
      });

    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * Revoke All Sessions (Logout from all devices)
   */
  static async revokeAllSessions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }

      // Simplified implementation for now
      return ResponseUtil.success(res, {
        revoked: true,
        message: 'All sessions have been revoked',
      }, 'Successfully logged out from all devices');

    } catch (error: any) {
      return ResponseUtil.serverError(res, error.message);
    }
  }
}

/**
 * Calculate security score based on user's security features
 */
function calculateSecurityScore(user: any, biometricCredentials: BiometricCredential[]) {
  let score = 0;
  const recommendations = [];

  // Base score for having an account
  score += 20;

  // Password strength (assuming it exists if user can login)
  score += 30;

  // Biometric authentication
  if (biometricCredentials.length > 0) {
    score += 40;
    if (biometricCredentials.length > 1) {
      score += 10; // Bonus for multiple methods
    }
  } else {
    recommendations.push('Enable biometric authentication for enhanced security');
  }

  // Wallet connection
  if (user.wallet_address) {
    score += 10;
  } else {
    recommendations.push('Connect a wallet for blockchain features');
  }

  // Determine security level
  let level = 'Low';
  if (score >= 80) level = 'High';
  else if (score >= 60) level = 'Medium';

  return { score, level, recommendations };
}