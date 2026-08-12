// Batched enrichment: fetch all jobs+skills in one go, update in batches of 100.
import mysql from "mysql2/promise";
import "dotenv/config";
const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 10000 });
const prefixRe = /^(We are looking for a talented .*? to join our team\. You will work on challenging problems with a collaborative group of engineers and product folks\. )/;

const [jobs] = await conn.query(`SELECT id, description FROM jobs WHERE published = 1`);
console.log('published jobs:', jobs.length);
// Fetch all job skills in one query
const [allSkills] = await conn.query(`SELECT js.jobId, s.name, js.weight FROM jobSkills js JOIN skills s ON s.id = js.skillId`);
const byJob = new Map();
for (const s of allSkills) { (byJob.get(s.jobId) || byJob.set(s.jobId, []).get(s.jobId)).push(s); }
const updates = [];
for (const j of jobs) {
  const m = j.description.match(prefixRe);
  if (!m) continue;
  const boilerplate = m[1];
  const sk = byJob.get(j.id) || [];
  if (!sk.length) continue;
  const all = sk.map(x => x.name);
  const req = sk.filter(x => x.weight === 'required').map(x => x.name);
  const desc = `${boilerplate}You will work with ${all.slice(0, 6).join(', ')}${all.length > 6 ? ' and more' : ''}. Requirements${req.length ? ': strong experience with ' + req.join(', ') : ''}, plus excellent problem-solving and communication skills. Responsibilities include designing, building, and shipping high-quality software, participating in code reviews, and mentoring teammates.`;
  updates.push([desc, j.id]);
}
console.log('job updates to apply:', updates.length);
for (let i = 0; i < updates.length; i += 100) {
  const batch = updates.slice(i, i + 100);
  const sql = `UPDATE jobs SET description = CASE id ${batch.map(([d, id]) => `WHEN ${id} THEN ${conn.escape(d)}`).join(' ')} END WHERE id IN (${batch.map(([, id]) => id).join(',')})`;
  await conn.query(sql);
  console.log(`jobs batch ${i / 100 + 1} done`);
}

// Candidates: one SELECT with joined skills
const [profRows] = await conn.query(`SELECT cp.id, cp.summary FROM candidateProfiles cp`);
const [allCSkills] = await conn.query(`SELECT cs.profileId, s.name FROM candidateSkills cs JOIN skills s ON s.id = cs.skillId`);
const byProf = new Map();
for (const s of allCSkills) {
  const a = byProf.get(s.profileId) || []; a.push(s); byProf.set(s.profileId, a);
}
const u2 = [];
for (const p of profRows) {
  const sk = (byProf.get(p.id) || []).slice(0, 5);
  if (!sk.length) continue;
  let sum = p.summary.replace(/ Skilled in .* technologies\.$/, '');
  sum = sum.replace(/\.\s*$/, '') + `. Skilled in ${sk.map(x => x.name).join(', ')} and related technologies.`;
  u2.push([sum, p.id]);
}
console.log('profile updates to apply:', u2.length);
for (let i = 0; i < u2.length; i += 200) {
  const batch = u2.slice(i, i + 200);
  const sql = `UPDATE candidateProfiles SET summary = CASE id ${batch.map(([s, id]) => `WHEN ${id} THEN ${conn.escape(s)}`).join(' ')} END WHERE id IN (${batch.map(([, id]) => id).join(',')})`;
  await conn.query(sql);
  console.log(`profiles batch ${i / 200 + 1} done`);
}
console.log('DONE');
await conn.end();
process.exit(0);
