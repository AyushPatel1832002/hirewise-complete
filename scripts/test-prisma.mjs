import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_AIhtPSeJc1R5@ep-solitary-violet-axz6i9v0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
});
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

const count = await prisma.job.count();
console.log('JOB COUNT:', count);

const jobs = await prisma.job.findMany({ take: 3, where: { published: true }, select: { id: true, title: true, remotePolicy: true } });
console.log('Sample jobs:', JSON.stringify(jobs, null, 2));

await prisma.$disconnect();
