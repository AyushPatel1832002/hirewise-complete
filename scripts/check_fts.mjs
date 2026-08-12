import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await conn.query("CREATE FULLTEXT INDEX idx_jobs_ft ON jobs (title, description) WITH PARSER ngram");
  console.log('FULLTEXT ngram OK');
  const [r] = await conn.query("SELECT id, title FROM jobs WHERE MATCH(title, description) AGAINST ('javascript' IN BOOLEAN MODE) LIMIT 3");
  console.log('MATCH query OK:', r.length);
  const [e] = await conn.query("EXPLAIN SELECT id FROM jobs WHERE MATCH(title, description) AGAINST ('javascript' IN BOOLEAN MODE)");
  console.log(e.map(r=>`${r.id}|${r.type}|${r.possible_keys}|${r.key}`).join('\n'));
} catch (err) {
  console.log('FULLTEXT failed:', err.message);
}
await conn.end();
