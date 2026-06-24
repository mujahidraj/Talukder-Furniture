import { Router } from 'express';
import multer from 'multer';
import * as bulkImportController from '../controllers/bulkImportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Multer config: store file in memory buffer (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .xlsx, .xls, and .csv files are allowed.'));
    }
  },
});

// Template download (protected)
router.get('/template', authMiddleware, bulkImportController.downloadTemplate);

// File upload (protected)
router.post('/upload', authMiddleware, upload.single('file'), bulkImportController.upload);

export default router;
