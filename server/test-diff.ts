
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.product.findFirst({
    where: { NOT: { sku: null } }
  });
  console.log('Product colors:', JSON.stringify(p?.colors));
  console.log('Product sizes:', JSON.stringify(p?.sizes));
}
run().catch(console.error).finally(() => prisma.$disconnect());

