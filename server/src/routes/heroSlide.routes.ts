import { Router } from 'express';
import { heroSlideController } from '../controllers/heroSlideController.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for slide uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads', 'slides');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter — images only
const imageFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Public endpoints
router.get('/', heroSlideController.getAll);
router.get('/:id', heroSlideController.getById);

// Protected admin endpoints
router.use(authMiddleware);

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const heroSlideSchema = Joi.object({
  title: Joi.string().optional().allow(null, ''),
  subtitle: Joi.string().optional().allow(null, ''),
  ctaText: Joi.string().optional().allow(null, ''),
  ctaLink: Joi.string().optional().allow(null, ''),
  order: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
  // image is handled by multer
});

router.post('/', upload.single('image'), validateRequest(heroSlideSchema), heroSlideController.create);
router.put('/:id', upload.single('image'), validateRequest(heroSlideSchema), heroSlideController.update);
router.delete('/:id', heroSlideController.delete);

export default router;

