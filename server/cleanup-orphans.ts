import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Fetching all in-use images from database...');
  
  const usedFiles = new Set<string>();

  // 1. Categories
  const categories = await prisma.category.findMany({ where: { imageUrl: { not: null } } });
  categories.forEach(c => { if (c.imageUrl) usedFiles.add(path.basename(c.imageUrl)); });

  // 2. ProductImages
  const productImages = await prisma.productImage.findMany();
  productImages.forEach(pi => {
    if (pi.url) usedFiles.add(path.basename(pi.url));
    if (pi.thumbUrl) usedFiles.add(path.basename(pi.thumbUrl));
  });

  // 3. ProductVariants
  const variants = await prisma.productVariant.findMany({ where: { swatchImage: { not: null } } });
  variants.forEach(v => { if (v.swatchImage) usedFiles.add(path.basename(v.swatchImage)); });

  // 4. Stores
  const stores = await prisma.store.findMany({ where: { imageUrl: { not: null } } });
  stores.forEach(s => { if (s.imageUrl) usedFiles.add(path.basename(s.imageUrl)); });

  // 5. HeroSlides
  const slides = await prisma.heroSlide.findMany();
  slides.forEach(s => { if (s.imageUrl) usedFiles.add(path.basename(s.imageUrl)); });

  // 6. TeamMembers
  const team = await prisma.teamMember.findMany();
  team.forEach(t => { if (t.imageUrl) usedFiles.add(path.basename(t.imageUrl)); });

  // 7. Sets
  const sets = await prisma.set.findMany();
  sets.forEach(s => {
    if (s.imageUrl) usedFiles.add(path.basename(s.imageUrl));
    if (s.imageUrls && Array.isArray(s.imageUrls)) {
      s.imageUrls.forEach(url => usedFiles.add(path.basename(url)));
    }
  });

  console.log(`Found ${usedFiles.size} unique image files referenced in database.`);

  const uploadDirs = [
    path.join(__dirname, 'uploads', 'images'),
    path.join(__dirname, 'uploads', 'thumbnails')
  ];

  let deletedCount = 0;
  let deletedSize = 0;

  for (const dir of uploadDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!usedFiles.has(file)) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isFile()) {
            deletedSize += stat.size;
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`Deleted orphan: ${dir.includes('thumbnails') ? 'thumbnail' : 'image'} -> ${file}`);
          }
        }
      }
    } else {
      console.log(`Directory does not exist, skipping: ${dir}`);
    }
  }

  const mbSaved = (deletedSize / (1024 * 1024)).toFixed(2);
  console.log(`\nCleanup complete! Deleted ${deletedCount} orphan images. Saved ${mbSaved} MB of space.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
