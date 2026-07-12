import path from 'path';
import * as bulkImageImportService from '../services/bulkImageImportService.js';
import config from '../config/index.js';

export const importImages = async (req, res, next) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({ error: 'Folder path is required and must be a string.' });
    }

    // Security: Validate that the folder path resolves within the allowed uploads directory
    // to prevent path traversal attacks (e.g., "../../etc/passwd")
    const allowedBase = path.resolve(config.upload.localPath);
    const resolvedPath = path.resolve(folderPath);
    if (!resolvedPath.startsWith(allowedBase)) {
      return res.status(400).json({ error: 'Invalid folder path. Path must be within the uploads directory.' });
    }

    const adminId = req.admin.id;

    const result = await bulkImageImportService.processImageImport(resolvedPath, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
