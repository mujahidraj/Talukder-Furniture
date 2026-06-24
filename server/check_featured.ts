import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const count = await prisma.product.count({ where: { isFeatured: true } });
  console.log('Featured products count:', count);
  await prisma.$disconnect();
})();
