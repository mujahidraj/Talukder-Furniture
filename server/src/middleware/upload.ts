import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import config from '../config/index.js';

// Ensure upload directories exist
const ensureDir = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
};

// Generate unique filename
const generateFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
};

// Multer memory storage (process with sharp before saving)
const storage = multer.memoryStorage();

// File filter — images only
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.'), false);
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20,
  },
});

/**
 * Process uploaded image with sharp:
 * - Resize to max dimensions
 * - Compress
 * - Generate thumbnail
 * - Save to disk (or S3 later)
 *
 * Returns { url, thumbUrl, width, height }
 */
export const processImage = async (file: any, options: any = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    thumbWidth = 300,
    thumbHeight = 300,
    quality = 85,
  } = options;

  const uploadDir = path.resolve(config.upload.localPath, 'images');
  const thumbDir = path.resolve(config.upload.localPath, 'thumbnails');

  await ensureDir(uploadDir);
  await ensureDir(thumbDir);

  const filename = generateFilename(file.originalname);
  const webpFilename = filename.replace(/\.[^.]+$/, '.webp');

  // Process main image → WebP
  const mainImage = sharp(file.buffer);
  const metadata = await mainImage.metadata();

  await mainImage
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toFile(path.join(uploadDir, webpFilename));

  // Generate thumbnail → WebP
  await sharp(file.buffer)
    .resize(thumbWidth, thumbHeight, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(path.join(thumbDir, webpFilename));

  const url = `/uploads/images/${webpFilename}`;
  const thumbUrl = `/uploads/thumbnails/${webpFilename}`;

  return {
    url,
    thumbUrl,
    originalName: file.originalname,
    width: Math.min(metadata.width || maxWidth, maxWidth),
    height: Math.min(metadata.height || maxHeight, maxHeight),
  };
};

/**
 * Delete an image and its thumbnail from disk.
 */
export const deleteImage = async (imageUrl, thumbUrl) => {
  try {
    if (imageUrl) {
      const imagePath = path.resolve('.' + imageUrl);
      await fs.unlink(imagePath).catch(() => {});
    }
    if (thumbUrl) {
      const thumbPath = path.resolve('.' + thumbUrl);
      await fs.unlink(thumbPath).catch(() => {});
    }
  } catch (err) {
    console.error('Error deleting image:', err.message);
  }
};
