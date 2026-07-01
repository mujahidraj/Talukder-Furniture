import { Router } from 'express';
import * as setController from '../controllers/setController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const setSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  categoryId: Joi.number().integer().allow(null).optional(),
  description: Joi.string().allow(null, '').optional(),
  basePrice: Joi.number().min(0).allow(null).optional(),
  discountPercentage: Joi.number().min(0).max(100).allow(null).optional(),
  isActive: Joi.boolean().optional(),
  imageUrl: Joi.string().allow(null, '').optional(),
  imageUrls: Joi.array().items(Joi.string()).optional(),
  productIds: Joi.array().items(Joi.number().integer()).optional()
});

// Public endpoints
router.get('/', setController.list);
router.get('/:slug', setController.getBySlug);

// Protected admin endpoints
router.use(authMiddleware);
router.get('/admin/:id', setController.getById);
router.post('/bulk-delete', setController.bulkDelete);
router.post('/', validateRequest(setSchema), setController.create);
router.put('/:id', validateRequest(setSchema), setController.update);
router.delete('/:id', setController.remove);

export default router;
