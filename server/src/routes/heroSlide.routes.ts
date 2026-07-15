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

// File filter — images and videos
const mediaFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// Public endpoints
router.get('/', heroSlideController.getAll);
router.get('/:id', heroSlideController.getById);

// Protected admin endpoints
router.use(authMiddleware);

import Joi from 'joi';
import { validateRequest } from '../middleware/validateRequest.js';

const heroSlideSchema = Joi.object({
  title: Joi.string().max(200).optional().allow(null, ''),
  subtitle: Joi.string().max(500).optional().allow(null, ''),
  ctaText: Joi.string().max(100).optional().allow(null, ''),
  ctaLink: Joi.string().max(500).optional().allow(null, ''), // #15 Fix
  order: Joi.number().integer().optional(),
  isActive: Joi.boolean().optional(),
  // image is handled by multer
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

router.post('/', uploadFields, validateRequest(heroSlideSchema), heroSlideController.create);
router.put('/:id', uploadFields, validateRequest(heroSlideSchema), heroSlideController.update);
router.delete('/:id', heroSlideController.delete);

export default router;

