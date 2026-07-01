import { Router } from 'express';
import * as adminUserController from '../controllers/adminUserController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all routes with auth
router.use(authMiddleware);

// All admins can view
router.get('/', requireRole('SUPER_ADMIN', 'ADMIN'), adminUserController.getAllAdmins);
router.get('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), adminUserController.getAdminById);

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const createAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('ADMIN', 'SUPER_ADMIN').required(),
});

const updateAdminSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('ADMIN', 'SUPER_ADMIN').optional(),
});

// Only Super Admins can modify
router.post('/', requireRole('SUPER_ADMIN'), validateRequest(createAdminSchema), adminUserController.createAdmin);
router.put('/:id', requireRole('SUPER_ADMIN'), validateRequest(updateAdminSchema), adminUserController.updateAdmin);
router.delete('/:id', requireRole('SUPER_ADMIN'), adminUserController.deleteAdmin);

export default router;
