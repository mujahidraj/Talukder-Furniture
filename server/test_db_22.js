import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, basePrice: true, overview: true, materials: true, _count: { select: { images: true } } }
  });
  
  const cleanHtml = (html) => html ? html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0 : false;
  
  let probablyIncomplete = [];
  
  for (const p of products) {
    let missing = [];
    if (p.basePrice === null || p.basePrice === undefined) missing.push('Price');
    if (!cleanHtml(p.overview)) missing.push('Overview');
    if (!p.sku || p.sku.trim() === '') missing.push('SKU');
    if (!cleanHtml(p.materials)) missing.push('Materials');
    if (p._count?.images === 0) missing.push('Images');
    
    // Check if anything else looks weird that might make a user think it's incomplete
    if (missing.length === 0 && (p.name.includes('Untitled') || p.name === '')) {
      missing.push('Name Issue');
    }
    
    if (missing.length > 0) {
      probablyIncomplete.push({ id: p.id, name: p.name, missing });
    }
  }
  
  console.log(`Found ${probablyIncomplete.length} incomplete products:`);
  console.log(probablyIncomplete);
}
test().catch(console.error).finally(() => prisma.$disconnect());
