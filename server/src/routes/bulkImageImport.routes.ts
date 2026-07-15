import { Router } from 'express';
import * as bulkImageImportController from '../controllers/bulkImageImportController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// #5 Fix: Only SUPER_ADMIN can scan filesystem for image imports
router.post('/', authMiddleware, requireRole('SUPER_ADMIN'), bulkImageImportController.importImages);

export default router;
