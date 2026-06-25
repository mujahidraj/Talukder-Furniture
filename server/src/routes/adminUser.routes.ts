import { Router } from 'express';
import * as adminUserController from '../controllers/adminUserController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all routes with auth
router.use(authMiddleware);

// All admins can view
router.get('/', requireRole('SUPER_ADMIN', 'admin', 'superadmin'), adminUserController.getAllAdmins);
router.get('/:id', requireRole('SUPER_ADMIN', 'admin', 'superadmin'), adminUserController.getAdminById);

// Only Super Admins can modify
router.post('/', requireRole('SUPER_ADMIN', 'superadmin'), adminUserController.createAdmin);
router.put('/:id', requireRole('SUPER_ADMIN', 'superadmin'), adminUserController.updateAdmin);
router.delete('/:id', requireRole('SUPER_ADMIN', 'superadmin'), adminUserController.deleteAdmin);

export default router;
