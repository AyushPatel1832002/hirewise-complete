import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const c = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await c.query("SHOW INDEX FROM applications");
  for (const r of rows) console.log(r.Key_name, r.Column_name, r.Non_unique, r.Index_type);
  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
