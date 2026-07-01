import { Router } from 'express';
import * as storeController from '../controllers/storeController.js';

const router = Router();

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const storeSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().optional().allow(null, ''),
  mapUrl: Joi.string().uri().optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
});

router.get('/', storeController.getAll);
router.get('/:id', storeController.getById);
router.post('/', validateRequest(storeSchema), storeController.create);
router.put('/:id', validateRequest(storeSchema), storeController.update);
router.delete('/:id', storeController.remove);

export default router;
