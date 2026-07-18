import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const categorySchema = Joi.object({
  name: Joi.string().max(200).required(),
  slug: Joi.string().max(200).optional(),
  parentId: Joi.number().integer().allow(null).optional(),
  imageUrl: Joi.string().uri().max(2000).allow(null, '').optional(), // #15 Fix
  order: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
});

// Public endpoints
router.get('/', optionalAuthMiddleware, categoryController.getTree);
router.get('/:slug', optionalAuthMiddleware, categoryController.getBySlug);

// Protected endpoints
router.use(authMiddleware);
router.post('/', validateRequest(categorySchema), categoryController.create);
router.put('/:id', validateRequest(categorySchema), categoryController.update);
router.delete('/:id', categoryController.remove);

export default router;
