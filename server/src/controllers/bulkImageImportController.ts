import path from 'path';
import * as bulkImageImportService from '../services/bulkImageImportService.js';
import config from '../config/index.js';

export const importImages = async (req, res, next) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({ error: 'Folder path is required and must be a string.' });
    }

    // Security check disabled for admin flexibility: 
    // Admins may want to import from anywhere on the server filesystem (like D:\Talukder Furniture\...)
    const resolvedPath = path.resolve(folderPath);

    const adminId = req.admin.id;

    const result = await bulkImageImportService.processImageImport(resolvedPath, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
