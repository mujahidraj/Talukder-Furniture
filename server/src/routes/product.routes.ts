import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as productController from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const productSchema = Joi.object({
  name: Joi.string().max(300).required(),
  slug: Joi.string().max(300).optional(),
  sku: Joi.string().max(100).allow(null, '').optional(),
  categoryId: Joi.number().integer().required(),
  materials: Joi.string().max(1000).allow(null, '').optional(),
  priceDisplay: Joi.string().max(100).allow(null, '').optional(),
  basePrice: Joi.number().min(0).allow(null).optional(),
  discountPercentage: Joi.number().min(0).max(100).allow(null).optional(),
  overview: Joi.string().max(20000).allow(null, '').optional(), // #15 Fix: Limit text fields
  keyFeatures: Joi.string().max(10000).allow(null, '').optional(),
  careMaintenance: Joi.string().max(10000).allow(null, '').optional(),
  warrantyInfo: Joi.string().max(10000).allow(null, '').optional(),
  returnExchangePolicy: Joi.string().max(10000).allow(null, '').optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  metaTitle: Joi.string().max(200).allow(null, '').optional(),
  metaDescription: Joi.string().max(500).allow(null, '').optional(),
  images: Joi.array().items(Joi.string()).max(50).optional(),
  colors: Joi.array().items(
    Joi.object({
      name: Joi.string().max(100).required(),
      hex: Joi.string().max(20).required()
    })
  ).max(50).optional(),
});

// Public endpoints
router.get('/', optionalAuthMiddleware, productController.list);
router.get('/search', productController.search);
router.get('/:slug', productController.getBySlug);

const viewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 view requests per `window` (here, per minute)
  message: 'Too many view requests from this IP, please try again after a minute'
});
router.post('/:slug/view', viewLimiter, productController.incrementView);

// Protected admin endpoints
router.use(authMiddleware);
router.get('/admin/:id', productController.getById);
router.post('/bulk-delete', productController.bulkDelete);
router.post('/', validateRequest(productSchema), productController.create);
router.put('/:id', validateRequest(productSchema), productController.update);
router.delete('/:id', productController.remove);

export default router;
