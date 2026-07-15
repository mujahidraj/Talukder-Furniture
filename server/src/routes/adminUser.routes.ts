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

// #21 Fix: Password complexity — min 8 chars, uppercase, lowercase, number, special char
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[0-9]/, 'number')
  .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'special character')
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one {#name}',
  });

const createAdminSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: passwordSchema.optional(),
  role: Joi.string().valid('ADMIN', 'SUPER_ADMIN').required(),
});

const updateAdminSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  password: passwordSchema.optional(),
  role: Joi.string().valid('ADMIN', 'SUPER_ADMIN').optional(),
  superAdminPassword: Joi.string().required(),  // #4 Fix: Required for admin updates
});

// Only Super Admins can modify
router.post('/', requireRole('SUPER_ADMIN'), validateRequest(createAdminSchema), adminUserController.createAdmin);
router.put('/:id', requireRole('SUPER_ADMIN'), validateRequest(updateAdminSchema), adminUserController.updateAdmin);
router.delete('/:id', requireRole('SUPER_ADMIN'), adminUserController.deleteAdmin);

export default router;
