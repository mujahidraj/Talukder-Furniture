import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AppError } from './errorHandler.js';

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches admin info to req.admin.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret as string) as any;

    (req as any).admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(error); // Will be caught by JWT error handlers in errorHandler
  }
};

/**
 * Role-based authorization middleware.
 * Must be used after authMiddleware.
 */
export const requireRole = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.admin) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.admin.role)) {
      return next(new AppError('Insufficient permissions.', 403));
    }

    next();
  };
};
