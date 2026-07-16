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
  // filename like: TFL-BED-109 LB.png, TFL-CBD-201 LB (2).png, set-109.png
  const basename = path.basename(filename, path.extname(filename)).trim();
  
  const lowerBase = basename.toLowerCase();
  if (lowerBase.startsWith('set ') || lowerBase.startsWith('set_') || lowerBase.startsWith('set-')) {
    // It's a set image. The identifier is the SKU.
    // e.g. "set-109", "set-109 (2)" -> "set-109"
    const cleanIdentifier = basename.replace(/\s*\(\d+\)$/, '').split('_copy')[0].trim();
    return { type: 'set', identifier: cleanIdentifier, originalFilename: path.basename(filename) };
  } else {
    // It's a product image. e.g. TFL-BED-109 LB or TFL-CBD-201 LB (2)
    // We want to extract the SKU: TFL-BED-109 LB
    // Remove any trailing (2), (3), etc.
    const cleanIdentifier = basename.replace(/\s*\(\d+\)$/, '').trim();
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
          const products = await prisma.product.findMany({
            where: {
              OR: [
                { sku: identifier },
                { sku: { startsWith: `${identifier}-` } }
              ]
            },
            include: { images: true }
          });

          if (products.length === 0) {
            report.unmatchedCount++;
            report.results.push({ file: originalFilename, status: 'unmatched', message: `No product found matching SKU: ${identifier}` });
            continue;
          }

          // Build the unique dedup key from the import root directory + relative file path
          const rootDirName = path.basename(folderPath);
          const relativePath = path.relative(folderPath, filePath).replace(/\\/g, '/');
          const uniqueAltText = `${rootDirName}/${relativePath}`;

          // Check which products already have this exact image (same directory source)
          const productsNeedingImage = products.filter(
            product => !product.images.some(img => img.altText === uniqueAltText)
          );

          if (productsNeedingImage.length === 0) {
            // ALL products already have this image from this exact directory — skip entirely
            report.skippedCount++;
            report.results.push({ 
              file: originalFilename, 
              status: 'skipped', 
              message: `Already imported from this directory for all ${products.length} matching product(s)` 
            });
            continue;
          }

          // Only NOW process the image file (since at least 1 product needs it)
          const fileBuffer = await fs.readFile(filePath);
          const fileObj = {
            buffer: fileBuffer,
            originalname: originalFilename,
            mimetype: 'image/' + path.extname(originalFilename).slice(1).replace('jpg', 'jpeg')
          };
          const processed = await processImage(fileObj);

          // Attach to all products that need it
          for (const product of productsNeedingImage) {
            const maxOrder = product.images.reduce((max, img) => Math.max(max, img.order), -1);

            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: processed.url,
                thumbUrl: processed.thumbUrl,
                altText: uniqueAltText,
                isPrimary: maxOrder === -1,
                order: maxOrder + 1
              }
            });
          }

          report.matchedCount++;
          report.results.push({ 
            file: originalFilename, 
            status: 'matched', 
            message: `Attached to ${productsNeedingImage.length} product(s) (SKU base: ${identifier})` 
          });

        } else if (type === 'set') {
          // identifier could be "set 109", "set-109", "set_109"
          const setNumMatch = identifier.match(/^set[\s_-]*(.*)$/i);
          const setNum = setNumMatch ? setNumMatch[1] : identifier;
          
          const possibleSkus = [
            `set-${setNum}`, `Set-${setNum}`, `SET-${setNum}`,
            `set ${setNum}`, `Set ${setNum}`, `SET ${setNum}`,
            `set_${setNum}`, `Set_${setNum}`, `SET_${setNum}`,
            setNum
          ];

          const sets = await prisma.set.findMany({
            where: {
              OR: [
                { sku: { in: possibleSkus } },
                { name: { contains: setNum, mode: 'insensitive' } },
                { slug: { contains: setNum, mode: 'insensitive' } }
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

          // Build unique dedup tag from import root directory + relative file path
          const rootDirName = path.basename(folderPath);
          const relativePath = path.relative(folderPath, filePath).replace(/\\/g, '/');
          const dedupTag = `__imported:${rootDirName}/${relativePath}`;

          // Check if this exact source file was already imported for this set
          if (set.imageUrls && set.imageUrls.includes(dedupTag)) {
            report.skippedCount++;
            report.results.push({ 
              file: originalFilename, 
              status: 'skipped', 
              message: `Already imported from this directory for set: ${set.name}` 
            });
            continue;
          }

          // Process image only if not a duplicate
          const fileBuffer = await fs.readFile(filePath);
          const fileObj = {
            buffer: fileBuffer,
            originalname: originalFilename,
            mimetype: 'image/' + path.extname(originalFilename).slice(1).replace('jpg', 'jpeg')
          };
          const processed = await processImage(fileObj);

          // Build update: push actual URL + dedup tag
          const updateData: any = {};
          if (!set.imageUrl) {
            updateData.imageUrl = processed.url;
          }
          
          updateData.imageUrls = {
            push: [processed.url, dedupTag]
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

  try {
    await prisma.bulkImportLog.create({
      data: {
        adminId,
        fileName: `Image Import: ${path.basename(folderPath)}`,
        totalRows: report.totalScanned,
        successCount: report.matchedCount,
        failCount: report.unmatchedCount + report.errorCount,
        status: report.errorCount > 0 ? (report.matchedCount > 0 ? 'completed' : 'failed') : 'completed',
        errorReport: report.results as any
      }
    });
  } catch (logErr) {
    console.error('Failed to save BulkImportLog for images:', logErr);
  }

  return report;
};
