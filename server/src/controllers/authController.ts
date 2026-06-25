import * as authService from '../services/authService.js';
import prisma from '../config/db.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({
      admin
    });
  } catch (error) {
    next(error);
  }
};
