import { Router } from 'express';
import { upload, processImage } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await processImage(req.file);
    res.json(result); // returns { url, thumbUrl, originalName, width, height }
  } catch (err) {
    next(err);
  }
});

export default router;
