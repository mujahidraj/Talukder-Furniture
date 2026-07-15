import { Router } from 'express';
import multer from 'multer';
import * as bulkImportController from '../controllers/bulkImportController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Multer config: store file in memory buffer (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
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

// #5 Fix: Only SUPER_ADMIN can bulk import
// Template download (protected)
router.get('/template', authMiddleware, requireRole('SUPER_ADMIN'), bulkImportController.downloadTemplate);

// File upload (protected)
router.post('/upload', authMiddleware, requireRole('SUPER_ADMIN'), upload.single('file'), bulkImportController.upload);

// Get recent logs (protected)
router.get('/logs', authMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), bulkImportController.getLogs);

export default router;
