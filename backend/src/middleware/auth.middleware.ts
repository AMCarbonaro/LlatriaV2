import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const payload = verifyAccessToken(token);

    // Add user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Invalid token',
    });
  }
}

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}



