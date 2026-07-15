import path from 'path';
import fs from 'fs/promises';
import * as bulkImageImportService from '../services/bulkImageImportService.js';
import config from '../config/index.js';


// Allowlisted base directories for bulk image import
const ALLOWED_BASE_DIRS = [
  path.resolve(config.upload.localPath),
  path.resolve(process.cwd()),
];

export const importImages = async (req, res, next) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({ error: 'Folder path is required and must be a string.' });
    }

    const resolvedPath = path.resolve(folderPath);

    // Security: Ensure resolved path is within an allowed base directory
    // OR if it explicitly contains the user's required "Documents/Product Images" folder anywhere in the path
    const isAllowed = ALLOWED_BASE_DIRS.some(baseDir =>
      resolvedPath.startsWith(baseDir + path.sep) || resolvedPath === baseDir
    ) || resolvedPath.includes(path.join('Documents', 'Product Images'));

    if (!isAllowed) {
      return res.status(403).json({
        error: 'Access denied. Folder path must be within the project or uploads directory.',
      });
    }

    // Verify the path actually exists and is a directory
    try {
      const stat = await fs.stat(resolvedPath);
      if (!stat.isDirectory()) {
        return res.status(400).json({ error: 'The specified path is not a directory.' });
      }
    } catch {
      return res.status(400).json({ error: 'The specified directory does not exist.' });
    }

    const adminId = req.admin.id;

    const result = await bulkImageImportService.processImageImport(resolvedPath, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
