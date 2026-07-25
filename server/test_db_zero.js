import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const products = await prisma.product.findMany({
    where: { basePrice: 0 }
  });
  console.log('Products with basePrice=0:', products.length, products.map(p => p.name));
  
  const productsZeroImages = await prisma.product.findMany({
    where: { images: { none: {} } }
  });
  console.log('Products with 0 images:', productsZeroImages.length);
}
test().catch(console.error).finally(() => prisma.$disconnect());
