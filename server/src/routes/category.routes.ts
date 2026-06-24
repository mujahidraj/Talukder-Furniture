import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const categorySchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  parentId: Joi.number().integer().allow(null).optional(),
  imageUrl: Joi.string().uri().allow(null, '').optional(),
  order: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
});

// Public endpoints
router.get('/', categoryController.getTree);
router.get('/:slug', categoryController.getBySlug);

// Protected endpoints
router.use(authMiddleware);
router.post('/', validateRequest(categorySchema), categoryController.create);
router.put('/:id', validateRequest(categorySchema), categoryController.update);
router.delete('/:id', categoryController.remove);

export default router;
