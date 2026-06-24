import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const productSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  sku: Joi.string().allow(null, '').optional(),
  categoryId: Joi.number().integer().required(),
  materials: Joi.string().allow(null, '').optional(),
  priceDisplay: Joi.string().allow(null, '').optional(),
  basePrice: Joi.number().min(0).allow(null).optional(),
  discountPercentage: Joi.number().min(0).max(100).allow(null).optional(),
  overview: Joi.string().allow(null, '').optional(),
  keyFeatures: Joi.string().allow(null, '').optional(),
  careMaintenance: Joi.string().allow(null, '').optional(),
  warrantyInfo: Joi.string().allow(null, '').optional(),
  returnExchangePolicy: Joi.string().allow(null, '').optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  metaTitle: Joi.string().allow(null, '').optional(),
  metaDescription: Joi.string().allow(null, '').optional(),
  images: Joi.array().items(Joi.string()).optional(),
  colors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      hex: Joi.string().required()
    })
  ).optional(),
});

// Public endpoints
router.get('/', productController.list);
router.get('/search', productController.search);
router.get('/:slug', productController.getBySlug);
router.post('/:slug/view', productController.incrementView);

// Protected admin endpoints
router.use(authMiddleware);
router.get('/admin/:id', productController.getById);
router.post('/bulk-delete', productController.bulkDelete);
router.post('/', validateRequest(productSchema), productController.create);
router.put('/:id', validateRequest(productSchema), productController.update);
router.delete('/:id', productController.remove);

export default router;
