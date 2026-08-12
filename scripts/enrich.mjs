// One-off enrichment: rewrite job descriptions & candidate summaries to include actual skill names.
import mysql from "mysql2/promise";
import "dotenv/config";
const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 10000 });

// Jobs: description like 'We are looking for a talented <sen title> to join our team...'
// Rebuild as: keep boilerplate prefix + skill names. Simpler: regex-replace.
const prefixRe = /^(We are looking for a talented .*? to join our team\. You will work on challenging problems with a collaborative group of engineers and product folks\. )(.+)$/s;

const [jobs] = await conn.query(`SELECT j.id, j.description FROM jobs j WHERE j.published = 1`);
console.log('jobs:', jobs.length);
let up = 0;
for (const j of jobs) {
  const m = j.description.match(prefixRe);
  if (!m) continue;
  const boilerplate = m[1];
  const rest = m[2].replace(/You will work with[^.]*\. /, '').replace(/Requirements: strong experience with [^.]*\./, '');
  // find skills for this job
  const [sk] = await conn.query(`SELECT s.name, js.weight FROM jobSkills js JOIN skills s ON s.id = js.skillId WHERE js.jobId = ${j.id}`);
  if (!sk.length) continue;
  const all = sk.map(x => x.name);
  const req = sk.filter(x => x.weight === 'required').map(x => x.name);
  const desc = `${boilerplate}You will work with ${all.slice(0, 6).join(', ')}${all.length > 6 ? ' and more' : ''}. Requirements${req.length ? ': strong experience with ' + req.join(', ') : ''}, plus excellent problem-solving and communication skills. Responsibilities include designing, building, and shipping high-quality software, participating in code reviews, and mentoring teammates.`;
  await conn.query(`UPDATE jobs SET description = ? WHERE id = ${j.id}`, [desc]);
  up++;
}
console.log('jobs updated:', up);

// Candidates: summary -> append 'Skilled in <top 5 skills>'
const [prof] = await conn.query(`SELECT cp.id, cp.userId, cp.summary FROM candidateProfiles cp`);
let up2 = 0;
for (const p of prof) {
  const [sk] = await conn.query(`SELECT s.name, cs.proficiency FROM candidateSkills cs JOIN skills s ON s.id = cs.skillId WHERE cs.profileId = ${p.id} ORDER BY FIELD(cs.proficiency,'expert','advanced','intermediate','beginner') LIMIT 5`);
  if (!sk.length) continue;
  let sum = p.summary.replace(/ Skilled in .* technologies\.$/, '');
  sum = sum.replace(/\.\s*$/, '') + `. Skilled in ${sk.map(x => x.name).join(', ')} and related technologies.`;
  await conn.query(`UPDATE candidateProfiles SET summary = ? WHERE id = ${p.id}`, [sum]);
  up2++;
}
console.log('profiles updated:', up2);
await conn.end();
process.exit(0);
