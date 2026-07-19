/**
 * Cleanup Script: Remove all product images beyond the first 2 per product.
 * Keeps images with order 0 and 1 (the first two), deletes everything else.
 * Also deletes the actual image files from disk.
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Match the upload path from server config
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

async function deleteFileByUrl(url: string | null | undefined) {
  if (!url) return;
  try {
    if (!url.startsWith('/uploads/')) return;
    const relativePath = url.substring('/uploads/'.length);
    const absolutePath = path.resolve(UPLOAD_DIR, relativePath);

    const uploadBaseDir = path.resolve(UPLOAD_DIR);
    if (!absolutePath.startsWith(uploadBaseDir + path.sep)) return;

    await fs.unlink(absolutePath);
    console.log(`  🗑️  Deleted file: ${absolutePath}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(`  ⚠️  Failed to delete: ${url}`, err.message);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🧹 PRODUCT IMAGE CLEANUP SCRIPT');
  console.log('   Keeping first 2 images per product, removing the rest.');
  console.log('='.repeat(60));
  console.log('');

  // Get all products with their images, ordered
  const products = await prisma.product.findMany({
    include: {
      images: {
        orderBy: { order: 'asc' }
      }
    }
  });

  let totalDeleted = 0;
  let productsAffected = 0;

  for (const product of products) {
    if (product.images.length <= 2) continue; // Nothing to clean

    productsAffected++;
    const imagesToKeep = product.images.slice(0, 2);
    const imagesToDelete = product.images.slice(2);

    console.log(`📦 Product: ${product.name} (SKU: ${product.sku})`);
    console.log(`   Total images: ${product.images.length} → Keeping: ${imagesToKeep.length}, Deleting: ${imagesToDelete.length}`);

    for (const img of imagesToDelete) {
      // Delete the actual files from disk
      await deleteFileByUrl(img.url);
      await deleteFileByUrl(img.thumbUrl);

      // Delete the DB record
      await prisma.productImage.delete({ where: { id: img.id } });
      totalDeleted++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ CLEANUP COMPLETE`);
  console.log(`   Products affected: ${productsAffected}`);
  console.log(`   Images deleted: ${totalDeleted}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
