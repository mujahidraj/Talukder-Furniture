import * as bulkImageImportService from '../services/bulkImageImportService.js';

export const importImages = async (req, res, next) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({ error: 'Folder path is required and must be a string.' });
    }

    const adminId = req.admin.id;

    const result = await bulkImageImportService.processImageImport(folderPath, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
