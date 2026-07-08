import fs from 'fs/promises';
import path from 'path';
import { processImage } from '../middleware/upload.js';
import prisma from '../config/db.js';

interface ImportReport {
  totalScanned: number;
  matchedCount: number;
  skippedCount: number; // Duplicates
  unmatchedCount: number;
  errorCount: number;
  logs: string[];
  results: {
    file: string;
    status: 'matched' | 'skipped' | 'unmatched' | 'error';
    message: string;
  }[];
}

async function scanDirectory(dir: string, fileList: string[] = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await scanDirectory(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function extractIdentifier(filename: string): { type: 'product' | 'set', identifier: string, originalFilename: string } {
  // filename like: TFL-BED-109 LB.png, TFL-CBD-201 LB (2).png, set 109.png
  const basename = path.basename(filename, path.extname(filename)).trim();
  
  const lowerBase = basename.toLowerCase();
  if (lowerBase.startsWith('set ') || lowerBase.startsWith('set_')) {
    // It's a set image. Extract the rest as identifier. e.g. "109", "110_copy"
    const identifier = basename.substring(4).trim();
    // Remove things like _copy or (2) if needed, but for sets maybe just take the first part
    const cleanIdentifier = identifier.split('_')[0].split('(')[0].trim();
    return { type: 'set', identifier: cleanIdentifier, originalFilename: path.basename(filename) };
  } else {
    // It's a product image. e.g. TFL-BED-109 LB or TFL-CBD-201 LB (2)
    // We want to extract the SKU: TFL-BED-109 LB
    // Remove any trailing (2), (3), etc.
    const cleanIdentifier = basename.replace(/\(\d+\)$/, '').trim();
    return { type: 'product', identifier: cleanIdentifier, originalFilename: path.basename(filename) };
  }
}

export const processImageImport = async (folderPath: string, adminId: number): Promise<ImportReport> => {
  const report: ImportReport = {
    totalScanned: 0,
    matchedCount: 0,
    skippedCount: 0,
    unmatchedCount: 0,
    errorCount: 0,
    logs: [],
    results: []
  };

  try {
    report.logs.push(`Scanning directory: ${folderPath}`);
    const files = await scanDirectory(folderPath);
    report.totalScanned = files.length;
    report.logs.push(`Found ${files.length} image files.`);

    for (const filePath of files) {
      try {
        const { type, identifier, originalFilename } = extractIdentifier(filePath);
        
        if (type === 'product') {
          // Look for product by SKU
          const product = await prisma.product.findUnique({
            where: { sku: identifier },
            include: { images: true }
          });

          if (!product) {
            report.unmatchedCount++;
            report.results.push({ file: originalFilename, status: 'unmatched', message: `No product found with SKU: ${identifier}` });
            continue;
          }

          // Check for duplicate by comparing original filename
          // We assume that if the product already has an image whose URL contains the original filename (or we can just check if an image with this exact name was already uploaded? The processImage renames it. So we need to track the original filename. Wait, ProductImage doesn't store originalName. We can check if `altText` could store it? Or we can just check if there's any image with the same base name. Actually, we can check if the product has the same number of images?
          // Since processImage generates a random name, we can't easily match the original filename unless we store it.
          // Let's store the originalFilename in `altText` to prevent duplicates.
          const isDuplicate = product.images.some(img => img.altText === originalFilename);
          if (isDuplicate) {
            report.skippedCount++;
            report.results.push({ file: originalFilename, status: 'skipped', message: `Image already exists for SKU: ${identifier}` });
            continue;
          }

          // Process the image
          const fileBuffer = await fs.readFile(filePath);
          const fileObj = {
            buffer: fileBuffer,
            originalname: originalFilename,
            mimetype: 'image/' + path.extname(originalFilename).slice(1).replace('jpg', 'jpeg')
          };

          const processed = await processImage(fileObj);

          // Get max order
          const maxOrder = product.images.reduce((max, img) => Math.max(max, img.order), -1);

          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: processed.url,
              thumbUrl: processed.thumbUrl,
              altText: originalFilename, // Store original filename here for deduplication
              isPrimary: maxOrder === -1, // First image is primary
              order: maxOrder + 1
            }
          });

          report.matchedCount++;
          report.results.push({ file: originalFilename, status: 'matched', message: `Matched to product SKU: ${identifier}` });

        } else if (type === 'set') {
          // Match set by checking if name or slug contains the identifier (e.g. "109")
          const sets = await prisma.set.findMany({
            where: {
              OR: [
                { name: { contains: identifier } },
                { slug: { contains: identifier } }
              ]
            }
          });

          if (sets.length === 0) {
            report.unmatchedCount++;
            report.results.push({ file: originalFilename, status: 'unmatched', message: `No set found containing: ${identifier}` });
            continue;
          }

          if (sets.length > 1) {
            report.unmatchedCount++;
            report.results.push({ file: originalFilename, status: 'unmatched', message: `Multiple sets found containing: ${identifier}. Cannot determine match.` });
            continue;
          }

          const set = sets[0];

          // Process image
          const fileBuffer = await fs.readFile(filePath);
          const fileObj = {
            buffer: fileBuffer,
            originalname: originalFilename,
            mimetype: 'image/' + path.extname(originalFilename).slice(1).replace('jpg', 'jpeg')
          };

          const processed = await processImage(fileObj);

          // Add to set. Check for duplicates in imageUrls
          // Since imageUrls is an array of generated paths, we don't have original filenames.
          // But we can check if it's already there? No, we can't easily.
          // We will just append it. If imageUrl is null, set it.
          const updateData: any = {};
          if (!set.imageUrl) {
            updateData.imageUrl = processed.url;
          }
          
          updateData.imageUrls = {
            push: processed.url
          };

          await prisma.set.update({
            where: { id: set.id },
            data: updateData
          });

          report.matchedCount++;
          report.results.push({ file: originalFilename, status: 'matched', message: `Matched to set: ${set.name}` });
        }

      } catch (err: any) {
        report.errorCount++;
        report.results.push({ file: path.basename(filePath), status: 'error', message: err.message });
      }
    }

    report.logs.push(`Import completed. Matched: ${report.matchedCount}, Skipped: ${report.skippedCount}, Unmatched: ${report.unmatchedCount}, Errors: ${report.errorCount}`);
    
  } catch (error: any) {
    report.logs.push(`Fatal Error: ${error.message}`);
    report.errorCount++;
  }

  return report;
};
