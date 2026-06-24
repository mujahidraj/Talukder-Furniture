import { Router } from 'express';
import * as storeController from '../controllers/storeController.js';

const router = Router();

router.get('/', storeController.getAll);
router.get('/:id', storeController.getById);
router.post('/', storeController.create);
router.put('/:id', storeController.update);
router.delete('/:id', storeController.remove);

export default router;
