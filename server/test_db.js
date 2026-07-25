import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, overview: true, materials: true, basePrice: true, _count: { select: { images: true } } }
  });
  console.log('Total products in DB:', products.length);
  
  const cleanHtml = (html) => html ? html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0 : false;
  
  let incompleteCountNew = 0;
  let incompleteCountOld = 0;
  
  for (const p of products) {
    // New logic
    let missingNew = [];
    if (p.basePrice === null || p.basePrice === undefined) missingNew.push('Price');
    if (!cleanHtml(p.overview)) missingNew.push('Overview');
    if (!p.sku || p.sku.trim() === '') missingNew.push('SKU');
    if (!cleanHtml(p.materials)) missingNew.push('Materials');
    if (p._count?.images === 0) missingNew.push('Images');
    if (missingNew.length > 0) incompleteCountNew++;

    // Old dashboard logic
    let isIncompleteOld = false;
    if (p.basePrice === null || !p.overview || p.sku === null || !p.materials || p._count?.images === 0) {
      isIncompleteOld = true;
    }
    if (isIncompleteOld) incompleteCountOld++;
  }
  console.log('Incomplete products (New logic):', incompleteCountNew);
  console.log('Incomplete products (Old Dashboard logic):', incompleteCountOld);
}
test().catch(console.error).finally(() => prisma.$disconnect());
