import { PrismaClient } from '@prisma/client';

// #23 Fix: Configure connection pooling for production
// For additional tuning, append ?connection_limit=10&pool_timeout=30 to DATABASE_URL
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasourceUrl: process.env.DATABASE_URL,
});

// Graceful shutdown: disconnect Prisma on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
