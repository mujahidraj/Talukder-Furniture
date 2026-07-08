import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sets = await prisma.set.findMany({
    select: { id: true, name: true, slug: true, imageUrl: true, imageUrls: true },
  });
  
  console.log('=== SETS ===');
  sets.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}, Slug: ${s.slug}, ImageUrl: ${s.imageUrl}, ImageUrls: ${JSON.stringify(s.imageUrls)}`));
  console.log(`\nTotal Sets: ${sets.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
