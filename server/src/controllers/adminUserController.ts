import { Request, Response, NextFunction } from 'express';
import * as adminUserService from '../services/adminUserService.js';

export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await adminUserService.getAllAdmins();
    res.json(admins);
  } catch (error) {
    next(error);
  }
};

export const getAdminById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await adminUserService.getAdminById(Number(req.params.id));
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await adminUserService.createAdmin(req.body);
    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentAdminId = (req as any).admin.id;
    const admin = await adminUserService.updateAdmin(Number(req.params.id), req.body, currentAdminId);
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prevent self deletion
    if (Number(req.params.id) === (req as any).admin.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }
    const result = await adminUserService.deleteAdmin(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
};
