import { Router } from 'express';
import * as faqController from '../controllers/faqController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const faqSchema = Joi.object({
  groupName: Joi.string().max(200).required(),
  question: Joi.string().max(500).required(),
  answer: Joi.string().max(10000).required(), // #15 Fix: Limit answer length
  order: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
});

// Public endpoints
router.get('/', faqController.getAll);
router.get('/:id', faqController.getById);

// Protected admin endpoints
router.use(authMiddleware);
router.post('/', validateRequest(faqSchema), faqController.create);
router.put('/:id', validateRequest(faqSchema), faqController.update);
router.delete('/:id', faqController.remove);

export default router;
