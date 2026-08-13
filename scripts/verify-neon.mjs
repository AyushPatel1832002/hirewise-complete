import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_AIhtPSeJc1R5@ep-solitary-violet-axz6i9v0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const tables = ['users','jobs','companies','locations','skills','applications','candidateProfiles','jobSkills'];
console.log('=== NEON DATABASE VERIFICATION ===');
for (const t of tables) {
  const r = await pool.query(`SELECT COUNT(*) as n FROM "${t}"`);
  console.log(`  ${t}: ${r.rows[0].n}`);
}

// Sample jobs
const jobs = await pool.query(`SELECT id, title, "remotePolicy", "salaryMin", "salaryMax" FROM "jobs" WHERE published = true LIMIT 5`);
console.log('\nSample published jobs:');
for (const j of jobs.rows) console.log(`  [${j.id}] ${j.title} | ${j.remotePolicy} | $${j.salaryMin}-$${j.salaryMax}`);

await pool.end();
