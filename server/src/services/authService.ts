import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import config from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

// In-memory brute force protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const login = async (email, password) => {
  const now = Date.now();
  const attemptRecord = loginAttempts.get(email);

  if (attemptRecord) {
    if (attemptRecord.lockedUntil > now) {
      const minutesLeft = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      throw new AppError(`Account is temporarily locked. Try again in ${minutesLeft} minutes.`, 429);
    }
  }

  const handleFailedAttempt = () => {
    const record = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      record.count = 0; // reset count after lock
    }
    loginAttempts.set(email, record);
    throw new AppError('Invalid email or password', 401);
  };
  const isFallbackSuperAdmin = email === config.admin.seedEmail && password === config.admin.seedPassword;

  let admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin && isFallbackSuperAdmin) {
    const passwordHash = await bcrypt.hash(config.admin.seedPassword, config.bcrypt.saltRounds);
    admin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: config.admin.seedEmail,
        passwordHash,
        role: 'SUPER_ADMIN',
      }
    });
  }

  if (!admin) {
    return handleFailedAttempt();
  }

  if (!isFallbackSuperAdmin) {
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return handleFailedAttempt();
    }
  }

  // Clear attempts on successful login
  loginAttempts.delete(email);

  const payload = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };

  const token = jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: config.jwt.expiresIn as any,
  });

  const refreshToken = jwt.sign({ id: admin.id }, config.jwt.refreshSecret as string, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token,
    refreshToken,
  };
};

export const refresh = async (refreshTokenString) => {
  if (!refreshTokenString) {
    throw new AppError('Refresh token required', 400);
  }

  try {
    const decoded = jwt.verify(refreshTokenString, config.jwt.refreshSecret as string) as any;
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });

    if (!admin) {
      throw new AppError('Admin not found', 401);
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = jwt.sign(payload, config.jwt.secret as string, {
      expiresIn: config.jwt.expiresIn as any,
    });

    const newRefreshToken = jwt.sign({ id: admin.id }, config.jwt.refreshSecret as string, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });

    return {
      token,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};
