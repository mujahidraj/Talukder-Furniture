import { Router } from 'express';
import * as jobController from '../controllers/jobController.js';

const router = Router();

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const jobSchema = Joi.object({
  title: Joi.string().required(),
  department: Joi.string().optional().allow(null, ''),
  location: Joi.string().optional().allow(null, ''),
  type: Joi.string().optional().allow(null, ''),
  description: Joi.string().optional().allow(null, ''),
  requirements: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
});

router.get('/', jobController.getAll);
router.get('/:id', jobController.getById);
router.post('/', validateRequest(jobSchema), jobController.create);
router.put('/:id', validateRequest(jobSchema), jobController.update);
router.delete('/:id', jobController.remove);

export default router;
