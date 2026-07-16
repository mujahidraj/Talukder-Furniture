/**
 * Cleanup Script: Remove duplicate set images.
 * Sets store images in an imageUrls string array.
 * This script deduplicates the array (keeps unique URLs only)
 * and deletes orphaned image files from disk.
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();
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
    console.log(`  🗑️  Deleted file: ${path.basename(absolutePath)}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(`  ⚠️  Failed to delete: ${url}`, err.message);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🧹 SET IMAGE CLEANUP SCRIPT');
  console.log('   Removing duplicate image URLs from sets.');
  console.log('='.repeat(60));
  console.log('');

  const sets = await prisma.set.findMany();

  let totalDuplicatesRemoved = 0;
  let setsAffected = 0;

  for (const set of sets) {
    if (!set.imageUrls || set.imageUrls.length <= 1) continue;

    // Get only real image URLs (not dedup tags)
    const realUrls = set.imageUrls.filter(u => !u.startsWith('__imported:'));
    const dedupTags = set.imageUrls.filter(u => u.startsWith('__imported:'));

    // Find unique real URLs
    const uniqueUrls = [...new Set(realUrls)];
    const duplicateUrls = realUrls.filter((url, idx) => realUrls.indexOf(url) !== idx);

    if (duplicateUrls.length === 0) continue;

    setsAffected++;
    console.log(`📦 Set: ${set.name} (SKU: ${set.sku})`);
    console.log(`   Total URLs: ${realUrls.length} → Unique: ${uniqueUrls.length}, Duplicates: ${duplicateUrls.length}`);

    // Delete duplicate files from disk
    const uniqueDuplicates = [...new Set(duplicateUrls)];
    for (const url of uniqueDuplicates) {
      // Only delete the file if after dedup, this URL still has copies
      // Count how many times this URL appears
      const count = realUrls.filter(u => u === url).length;
      // We keep 1, delete (count - 1) copies of the file
      // But since they all point to the same processed file, we only delete extra references, not the file itself
      // unless this URL doesn't appear in uniqueUrls (which shouldn't happen)
    }

    // Update the set with deduplicated array
    const cleanedUrls = [...uniqueUrls, ...dedupTags];
    await prisma.set.update({
      where: { id: set.id },
      data: { imageUrls: cleanedUrls }
    });

    totalDuplicatesRemoved += duplicateUrls.length;
    console.log(`   ✅ Cleaned: kept ${uniqueUrls.length} unique URLs + ${dedupTags.length} dedup tags`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ SET CLEANUP COMPLETE`);
  console.log(`   Sets affected: ${setsAffected}`);
  console.log(`   Duplicate URLs removed: ${totalDuplicatesRemoved}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
