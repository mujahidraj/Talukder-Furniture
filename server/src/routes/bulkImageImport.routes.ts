import { Router } from 'express';
import * as bulkImageImportController from '../controllers/bulkImageImportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// File upload (protected)
router.post('/', authMiddleware, bulkImageImportController.importImages);

export default router;
