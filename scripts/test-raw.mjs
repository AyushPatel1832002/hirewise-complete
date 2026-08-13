// Test exact same Prisma setup as vercel-handler uses
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  // Raw SQL test
  const raw = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "jobs"`;
  console.log('RAW COUNT:', raw);

  // Model test
  const count = await prisma.job.count();
  console.log('MODEL COUNT:', count);

  const jobs = await prisma.job.findMany({ take: 3, where: { published: true }, select: { id: true, title: true } });
  console.log('FINDMANY:', jobs);
} catch(e) {
  console.error('ERROR:', e.message);
} finally {
  await prisma.$disconnect();
}
