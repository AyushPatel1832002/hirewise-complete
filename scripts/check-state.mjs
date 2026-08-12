import mysql from "mysql2/promise";

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
const [counts] = await conn.query(`
  SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM companies) AS companies,
    (SELECT COUNT(*) FROM candidateProfiles) AS profiles,
    (SELECT COUNT(*) FROM jobs) AS jobs,
    (SELECT COUNT(*) FROM applications) AS applications
`);
console.log(JSON.stringify(counts[0]));
// check openId uniqueness among existing users
const [openIds] = await conn.query(`
  SELECT openId, COUNT(*) AS c FROM users GROUP BY openId HAVING c > 1 LIMIT 5
`);
console.log("dup openIds:", JSON.stringify(openIds));
const [sample] = await conn.query("SELECT id, openId, userType FROM users ORDER BY id DESC LIMIT 5");
console.log(JSON.stringify(sample));
await conn.end();
