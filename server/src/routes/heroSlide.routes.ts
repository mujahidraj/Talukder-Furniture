import { Router } from 'express';
import { heroSlideController } from '../controllers/heroSlideController.js';
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

const upload = multer({ storage: storage });

router.get('/', heroSlideController.getAll);
router.get('/:id', heroSlideController.getById);

// Admin only (assuming middleware is handled at index.ts or similarly)
router.post('/', upload.single('image'), heroSlideController.create);
router.put('/:id', upload.single('image'), heroSlideController.update);
router.delete('/:id', heroSlideController.delete);

export default router;
