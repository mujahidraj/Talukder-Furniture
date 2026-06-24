import { Router } from 'express';
import * as leadController from '../controllers/leadController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

const createLeadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, '').optional(),
  referenceNumber: Joi.string().allow(null, '').optional(),
  message: Joi.string().required(),
  source: Joi.string().valid('contact-form', 'faq-form', 'product-enquiry').optional(),
  category: Joi.string().allow(null, '').optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'seen', 'replied', 'resolved').required(),
});

// Public endpoint to submit form
router.post('/', validateRequest(createLeadSchema), leadController.submit);

// Protected admin endpoints
router.use(authMiddleware);
router.get('/', leadController.list);
router.patch('/:id/status', validateRequest(updateStatusSchema), leadController.updateStatus);
router.delete('/:id', leadController.remove);

export default router;
