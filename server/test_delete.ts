import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  try {
    const products = await prisma.product.findMany({ take: 2 });
    if (products.length > 0) {
      console.log('Trying to delete products:', products.map(p => p.id));
      const res = await prisma.product.deleteMany({
        where: { id: { in: products.map(p => p.id) } }
      });
      console.log('SUCCESS', res);
    }
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
})();
