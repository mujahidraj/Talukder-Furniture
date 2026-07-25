import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, overview: true, materials: true, basePrice: true, _count: { select: { images: true } } }
  });
  
  let mP = 0, mO = 0, mS = 0, mM = 0, mI = 0;
  const cleanHtml = (html) => html ? html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0 : false;
  
  for (const p of products) {
    if (p.basePrice === null || p.basePrice === undefined) mP++;
    if (!cleanHtml(p.overview)) mO++;
    if (!p.sku || p.sku.trim() === '') mS++;
    if (!cleanHtml(p.materials)) mM++;
    if (p._count?.images === 0) mI++;
  }
  
  console.log('Missing Price:', mP);
  console.log('Missing Overview:', mO);
  console.log('Missing SKU:', mS);
  console.log('Missing Materials:', mM);
  console.log('Missing Images:', mI);
  console.log('Total Missing Occurrences:', mP + mO + mS + mM + mI);
}
test().catch(console.error).finally(() => prisma.$disconnect());
