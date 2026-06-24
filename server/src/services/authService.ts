import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import config from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const login = async (email, password) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

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
