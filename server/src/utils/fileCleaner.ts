import path from 'path';
import fs from 'fs/promises';
import config from '../config/index.js';

/**
 * securely deletes a file given its public URL (e.g. /uploads/images/abc.jpg)
 */
export const deleteFileByUrl = async (url: string | null | undefined): Promise<void> => {
  if (!url) return;
  
  try {
    // Basic validation: ensure the URL starts with /uploads/
    if (!url.startsWith('/uploads/')) return;
    
    // Convert public URL to local file path
    // Remove the leading /uploads/ to get the relative path
    const relativePath = url.substring('/uploads/'.length);
    const absolutePath = path.resolve(config.upload.localPath, relativePath);

    // Security check: ensure the resolved path is actually inside the local upload directory
    const uploadBaseDir = path.resolve(config.upload.localPath);
    if (!absolutePath.startsWith(uploadBaseDir + path.sep)) {
      console.warn(`[FileCleaner] Attempted to delete file outside upload directory: ${absolutePath}`);
      return;
    }

    // Unlink the file
    await fs.unlink(absolutePath);
    console.log(`[FileCleaner] Deleted: ${absolutePath}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(`[FileCleaner] Failed to delete file at ${url}:`, err.message);
    }
  }
};

/**
 * securely deletes multiple files given their public URLs
 */
export const deleteFilesByUrls = async (urls: (string | null | undefined)[]): Promise<void> => {
  if (!urls || urls.length === 0) return;
  
  await Promise.all(
    urls.map(url => deleteFileByUrl(url))
  );
};
