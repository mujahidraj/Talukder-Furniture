import { Router } from 'express';
import * as setController from '../controllers/setController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const setSchema = Joi.object({
  name: Joi.string().max(300).required(),
  slug: Joi.string().max(300).optional(),
  sku: Joi.string().max(100).allow(null, '').optional(),
  categoryId: Joi.number().integer().allow(null).optional(),
  description: Joi.string().max(20000).allow(null, '').optional(), // #15 Fix
  basePrice: Joi.number().min(0).allow(null).optional(),
  discountPercentage: Joi.number().min(0).max(100).allow(null).optional(),
  isActive: Joi.boolean().optional(),
  imageUrl: Joi.string().max(500).allow(null, '').optional(),
  imageUrls: Joi.array().items(Joi.string().max(500)).max(50).optional(),
  productIds: Joi.array().items(Joi.number().integer()).max(200).optional()
});

// Public endpoints
router.get('/', optionalAuthMiddleware, setController.list);
router.get('/:slug', optionalAuthMiddleware, setController.getBySlug);

// Protected admin endpoints
router.use(authMiddleware);
router.get('/admin/:id', setController.getById);
router.post('/bulk-delete', setController.bulkDelete);
router.post('/', validateRequest(setSchema), setController.create);
router.put('/:id', validateRequest(setSchema), setController.update);
router.delete('/:id', setController.remove);

export default router;
