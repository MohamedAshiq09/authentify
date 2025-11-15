import jwt from 'jsonwebtoken';
import { config } from '../config/environment.config';
import { TokenPayload, TokenPair } from '../types/session.types';

export class JWTUtil {
  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(payload: TokenPayload): string {
    if (!config.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY,
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(payload: TokenPayload): string {
    if (!config.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY,
    } as jwt.SignOptions);
  }

  /**
   * Generate both tokens
   */
  static generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    } catch (error: any) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}