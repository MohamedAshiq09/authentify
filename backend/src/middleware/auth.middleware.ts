import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    walletAddress?: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseUtil.unauthorized(res, 'Access token required');
  }

  try {
    const decoded = JWTUtil.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    return ResponseUtil.unauthorized(res, 'Invalid or expired token');
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = JWTUtil.verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we continue without user
    }
  }
  
  next();
};