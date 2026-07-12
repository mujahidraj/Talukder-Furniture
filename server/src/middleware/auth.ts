import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AppError } from './errorHandler.js';
import prisma from '../config/db.js';

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches admin info to req.admin.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret as string) as any;
    
    let currentRole = decoded.role;
    
    // Verify the admin still exists in the database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });
    
    if (!admin) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }
    
    currentRole = admin.role;

    (req as any).admin = {
      id: decoded.id,
      email: decoded.email,
      role: currentRole,
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
 * Optional JWT authentication middleware.
 * If a valid token is provided, sets req.admin. Otherwise, continues without error.
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret as string) as any;
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    
    if (admin) {
      (req as any).admin = {
        id: decoded.id,
        email: decoded.email,
        role: admin.role,
      };
    }
    next();
  } catch (error) {
    // Ignore errors for optional auth (e.g., expired token just acts as unauthenticated)
    next();
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
