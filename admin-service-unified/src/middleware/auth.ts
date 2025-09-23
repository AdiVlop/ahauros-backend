import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole, APIResponse } from '@/types';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const response: APIResponse = {
      success: false,
      error: 'Access token required',
      timestamp: new Date()
    };
    res.status(401).json(response);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: 'Invalid or expired token',
      timestamp: new Date()
    };
    res.status(403).json(response);
  }
};

export const requireRole = (roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: APIResponse = {
        success: false,
        error: 'Authentication required',
        timestamp: new Date()
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: APIResponse = {
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date()
      };
      res.status(403).json(response);
      return;
    }

    next();
  };

