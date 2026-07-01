import { Router } from 'express';
import * as faqController from '../controllers/faqController.js';

const router = Router();

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const faqSchema = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().required(),
  order: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
});

router.get('/', faqController.getAll);
router.get('/:id', faqController.getById);
router.post('/', validateRequest(faqSchema), faqController.create);
router.put('/:id', validateRequest(faqSchema), faqController.update);
router.delete('/:id', faqController.remove);

export default router;
