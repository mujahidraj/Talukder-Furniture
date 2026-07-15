import { Router } from 'express';
import * as storeController from '../controllers/storeController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const storeSchema = Joi.object({
  name: Joi.string().max(200).required(),
  address: Joi.string().max(500).required(),
  city: Joi.string().max(100).optional().allow(null, ''),
  phone: Joi.string().max(30).optional().allow(null, ''),
  email: Joi.string().email().max(254).optional().allow(null, ''),
  mapUrl: Joi.string().uri().max(2000).optional().allow(null, ''), // #15 Fix
  isActive: Joi.boolean().optional(),
});

// Public endpoints
router.get('/', storeController.getAll);
router.get('/:id', storeController.getById);

// Protected admin endpoints
router.use(authMiddleware);
router.post('/', validateRequest(storeSchema), storeController.create);
router.put('/:id', validateRequest(storeSchema), storeController.update);
router.delete('/:id', storeController.remove);

export default router;
