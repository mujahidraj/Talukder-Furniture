import { Router } from 'express';
import * as faqController from '../controllers/faqController.js';

const router = Router();

router.get('/', faqController.getAll);
router.get('/:id', faqController.getById);
router.post('/', faqController.create);
router.put('/:id', faqController.update);
router.delete('/:id', faqController.remove);

export default router;
