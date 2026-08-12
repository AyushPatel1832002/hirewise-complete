import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
// Test ngram tokenizer function (TiDB supports NGRAM_TOKENIZE? no) — just check MATCH with parser innodb fails too; instead test LIKE performance
const t0 = Date.now();
const [r] = await conn.query("SELECT COUNT(*) AS c FROM jobs WHERE title LIKE '%javascript%' OR description LIKE '%javascript%'");
console.log('LIKE javascript:', r[0].c, 'ms:', Date.now()-t0);
// Check location counts
const [l] = await conn.query("SELECT COUNT(*) AS c FROM locations");
console.log('locations:', l[0].c);
await conn.end();
