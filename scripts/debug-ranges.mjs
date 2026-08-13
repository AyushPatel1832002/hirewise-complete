import mysql from 'mysql2/promise';
const conn = await mysql.createConnection('mysql://3pXYBN7ALdP3R8i.root:BGnF8OX9e1BrMFV0iO77@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/Xa5WK2zgALVZPriP2m7kh2?ssl={"rejectUnauthorized":true}');
const [r1] = await conn.execute('SELECT MIN(id) as minId, MAX(id) as maxId, COUNT(*) as cnt FROM candidateProfiles');
const [r2] = await conn.execute('SELECT MIN(profileId) as minId, MAX(profileId) as maxId, COUNT(*) as cnt FROM candidateSkills');
const [r3] = await conn.execute('SELECT MIN(profileId) as minId, MAX(profileId) as maxId, COUNT(*) as cnt FROM applications');
console.log('candidateProfiles:', r1[0]);
console.log('candidateSkills.profileId:', r2[0]);
console.log('applications.profileId:', r3[0]);
// Sample a few profile IDs
const [sample] = await conn.execute('SELECT id FROM candidateProfiles LIMIT 5');
console.log('sample profile IDs:', sample.map(r => r.id));
const [cs] = await conn.execute('SELECT DISTINCT profileId FROM candidateSkills LIMIT 5');
console.log('sample candidateSkills profileIds:', cs.map(r => r.profileId));
await conn.end();
