import mysql from "mysql2/promise";
import "dotenv/config";
const conn = await mysql.createConnection(process.env.DATABASE_URL);
try { const [r] = await conn.execute("SELECT SIMILARITY_CAND('javascript', 'javascrpt') AS s"); console.log('SIMILARITY_CAND OK', JSON.stringify(r)); }
catch(e){ console.log('SIMILARITY_CAND MISSING:', e.message.slice(0,120)); }
await conn.end();
