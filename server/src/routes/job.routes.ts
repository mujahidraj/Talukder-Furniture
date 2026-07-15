import { Router } from 'express';
import * as jobController from '../controllers/jobController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const jobSchema = Joi.object({
  title: Joi.string().max(300).required(),
  department: Joi.string().max(200).optional().allow(null, ''),
  location: Joi.string().max(300).optional().allow(null, ''),
  type: Joi.string().max(50).optional().allow(null, ''),
  description: Joi.string().max(20000).optional().allow(null, ''), // #15 Fix: Limit text fields
  requirements: Joi.string().max(10000).optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
});

// Public endpoints
router.get('/', jobController.getAll);
router.get('/:id', jobController.getById);

// Protected admin endpoints
router.use(authMiddleware);
router.post('/', validateRequest(jobSchema), jobController.create);
router.put('/:id', validateRequest(jobSchema), jobController.update);
router.delete('/:id', jobController.remove);

export default router;
