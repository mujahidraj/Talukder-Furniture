import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', dashboardController.getStats);
router.get('/incomplete-products', dashboardController.getIncompleteProducts);

export default router;
