/**
 * Non-destructive migration: MySQL/TiDB → PostgreSQL
 * Reads all data from source, writes to target PostgreSQL.
 * Safe to run multiple times (upserts where possible).
 *
 * Usage:
 *   POSTGRES_URL="postgresql://..." node scripts/migrate-to-postgres.mjs
 */

import mysql from 'mysql2/promise';
import pg from 'pg';
import { readFileSync } from 'fs';

const MYSQL_URL = 'mysql://3pXYBN7ALdP3R8i.root:BGnF8OX9e1BrMFV0iO77@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/Xa5WK2zgALVZPriP2m7kh2?ssl={"rejectUnauthorized":true}';
const POSTGRES_URL = 'postgresql://neondb_owner:npg_AIhtPSeJc1R5@ep-solitary-violet-axz6i9v0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

if (!POSTGRES_URL) {
  console.error('ERROR: Set POSTGRES_URL or DATABASE_URL env var');
  process.exit(1);
}

const src = await mysql.createPool({ uri: MYSQL_URL, waitForConnections: true, connectionLimit: 5 });
const dst = new pg.Pool({ connectionString: POSTGRES_URL });

async function q(sql, params = []) {
  const [rows] = await src.execute(sql, params);
  return rows;
}

async function pgRun(sql, params = []) {
  return dst.query(sql, params);
}

function pgVal(v) {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'object' && !Array.isArray(v)) return JSON.stringify(v);
  return v;
}

function log(msg) { console.log(`[migrate] ${msg}`); }

// ─── Disable FK checks on target ─────────────────────────────────────────────
// Note: Neon doesn't support session_replication_role, so we insert in FK-safe order

// ─── LOCATIONS ───────────────────────────────────────────────────────────────
log('locations...');
const locations = await q('SELECT * FROM locations');
for (const r of locations) {
  await pgRun(`
    INSERT INTO locations (id, city, region, country, "displayName", latitude, longitude)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (id) DO UPDATE SET
      city=EXCLUDED.city, region=EXCLUDED.region, country=EXCLUDED.country,
      "displayName"=EXCLUDED."displayName", latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude
  `, [r.id, r.city, r.region, r.country, r.displayName, r.latitude, r.longitude]);
}
log(`  → ${locations.length} locations`);

// ─── SKILLS ──────────────────────────────────────────────────────────────────
log('skills...');
const skills = await q('SELECT * FROM skills');
for (const r of skills) {
  await pgRun(`
    INSERT INTO skills (id, name, slug, category, "createdAt")
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, category=EXCLUDED.category
  `, [r.id, r.name, r.slug, r.category, r.createdAt]);
}
log(`  → ${skills.length} skills`);

// ─── SKILL ALIASES ───────────────────────────────────────────────────────────
log('skillAliases...');
const aliases = await q('SELECT * FROM skillAliases');
for (const r of aliases) {
  await pgRun(`
    INSERT INTO "skillAliases" (id, alias, "skillId")
    VALUES ($1,$2,$3)
    ON CONFLICT (id) DO UPDATE SET alias=EXCLUDED.alias, "skillId"=EXCLUDED."skillId"
  `, [r.id, r.alias, r.skillId]);
}
log(`  → ${aliases.length} skillAliases`);

// ─── USERS ───────────────────────────────────────────────────────────────────
log('users...');
const users = await q('SELECT * FROM users');
for (const r of users) {
  await pgRun(`
    INSERT INTO users (id, "openId", name, email, "loginMethod", role, "userType", "createdAt", "updatedAt", "lastSignedIn")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name, email=EXCLUDED.email, "loginMethod"=EXCLUDED."loginMethod",
      role=EXCLUDED.role, "userType"=EXCLUDED."userType", "lastSignedIn"=EXCLUDED."lastSignedIn"
  `, [r.id, r.openId, r.name, r.email, r.loginMethod, r.role||'user', r.userType||'candidate',
      r.createdAt, r.updatedAt, r.lastSignedIn]);
}
log(`  → ${users.length} users`);

// ─── COMPANIES ───────────────────────────────────────────────────────────────
log('companies...');
const companies = await q('SELECT * FROM companies');
// Map MySQL enum size values to Prisma mapped values
const sizeMap = {'1-10':'1-10','11-50':'11-50','51-200':'51-200','201-1000':'201-1000','1000+':'1000+'};
for (const r of companies) {
  await pgRun(`
    INSERT INTO companies (id, name, description, industry, website, size, "locationId", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name, description=EXCLUDED.description, industry=EXCLUDED.industry,
      website=EXCLUDED.website, size=EXCLUDED.size, "locationId"=EXCLUDED."locationId"
  `, [r.id, r.name, r.description, r.industry, r.website, r.size||null, r.locationId||null, r.createdAt, r.updatedAt]);
}
log(`  → ${companies.length} companies`);

// ─── COMPANY MEMBERS ─────────────────────────────────────────────────────────
log('companyMembers...');
const members = await q('SELECT * FROM companyMembers');
for (const r of members) {
  await pgRun(`
    INSERT INTO "companyMembers" (id, "userId", "companyId", role, "createdAt")
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (id) DO UPDATE SET role=EXCLUDED.role
  `, [r.id, r.userId, r.companyId, r.role||'member', r.createdAt]);
}
log(`  → ${members.length} companyMembers`);

// ─── JOBS ─────────────────────────────────────────────────────────────────────
log('jobs...');
const jobs = await q('SELECT * FROM jobs');
// Map employmentType: "full-time" → "full-time" (stored as mapped value in PG)
for (const r of jobs) {
  await pgRun(`
    INSERT INTO jobs (id, "companyId", title, description, seniority, "employmentType", "salaryMin", "salaryMax", "locationId", "remotePolicy", published, "applicationCount", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT (id) DO UPDATE SET
      title=EXCLUDED.title, description=EXCLUDED.description, seniority=EXCLUDED.seniority,
      "employmentType"=EXCLUDED."employmentType", "salaryMin"=EXCLUDED."salaryMin",
      "salaryMax"=EXCLUDED."salaryMax", "locationId"=EXCLUDED."locationId",
      "remotePolicy"=EXCLUDED."remotePolicy", published=EXCLUDED.published,
      "applicationCount"=EXCLUDED."applicationCount"
  `, [r.id, r.companyId, r.title, r.description, r.seniority, r.employmentType||'full-time',
      r.salaryMin||null, r.salaryMax||null, r.locationId||null, r.remotePolicy,
      r.published===1||r.published===true, r.applicationCount||0, r.createdAt, r.updatedAt]);
}
log(`  → ${jobs.length} jobs`);

// ─── JOB SKILLS ───────────────────────────────────────────────────────────────
log('jobSkills...');
const jobSkills = await q('SELECT * FROM jobSkills');
for (const r of jobSkills) {
  await pgRun(`
    INSERT INTO "jobSkills" (id, "jobId", "skillId", weight)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (id) DO UPDATE SET weight=EXCLUDED.weight
  `, [r.id, r.jobId, r.skillId, r.weight]);
}
log(`  → ${jobSkills.length} jobSkills`);

// ─── CANDIDATE PROFILES ───────────────────────────────────────────────────────
log('candidateProfiles...');
const profiles = await q('SELECT * FROM candidateProfiles');
for (const r of profiles) {
  await pgRun(`
    INSERT INTO "candidateProfiles" (id, "userId", headline, summary, "currentTitle", "yearsOfExperience", "locationId", "remotePolicy", "desiredSalaryMin", "desiredSalaryMax", "resumeUrl", "resumeFileName", active, "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    ON CONFLICT (id) DO UPDATE SET
      headline=EXCLUDED.headline, summary=EXCLUDED.summary, "currentTitle"=EXCLUDED."currentTitle",
      "yearsOfExperience"=EXCLUDED."yearsOfExperience", "locationId"=EXCLUDED."locationId",
      "remotePolicy"=EXCLUDED."remotePolicy", "desiredSalaryMin"=EXCLUDED."desiredSalaryMin",
      "desiredSalaryMax"=EXCLUDED."desiredSalaryMax", active=EXCLUDED.active
  `, [r.id, r.userId, r.headline, r.summary, r.currentTitle, r.yearsOfExperience||null,
      r.locationId||null, r.remotePolicy||null, r.desiredSalaryMin||null, r.desiredSalaryMax||null,
      r.resumeUrl||null, r.resumeFileName||null, r.active===1||r.active===true, r.createdAt, r.updatedAt]);
}
log(`  → ${profiles.length} candidateProfiles`);

// ─── CANDIDATE SKILLS ─────────────────────────────────────────────────────────
log('candidateSkills...');
const candSkills = await q('SELECT * FROM candidateSkills');
for (const r of candSkills) {
  await pgRun(`
    INSERT INTO "candidateSkills" (id, "profileId", "skillId", proficiency, years, "createdAt")
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (id) DO UPDATE SET proficiency=EXCLUDED.proficiency, years=EXCLUDED.years
  `, [r.id, r.profileId, r.skillId, r.proficiency, r.years||0, r.createdAt]);
}
log(`  → ${candSkills.length} candidateSkills`);

// ─── WORK EXPERIENCES ─────────────────────────────────────────────────────────
log('workExperiences...');
const workExp = await q('SELECT * FROM workExperiences');
for (const r of workExp) {
  await pgRun(`
    INSERT INTO "workExperiences" (id, "profileId", title, company, "startDate", "endDate", current, description)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, company=EXCLUDED.company,
      "startDate"=EXCLUDED."startDate", "endDate"=EXCLUDED."endDate",
      current=EXCLUDED.current, description=EXCLUDED.description
  `, [r.id, r.profileId, r.title, r.company, r.startDate||null, r.endDate||null,
      r.current===1||r.current===true, r.description||null]);
}
log(`  → ${workExp.length} workExperiences`);

// ─── EDUCATION ────────────────────────────────────────────────────────────────
log('education...');
const edu = await q('SELECT * FROM education');
for (const r of edu) {
  await pgRun(`
    INSERT INTO education (id, "profileId", institution, degree, "fieldOfStudy", "startYear", "endYear")
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (id) DO UPDATE SET institution=EXCLUDED.institution, degree=EXCLUDED.degree,
      "fieldOfStudy"=EXCLUDED."fieldOfStudy", "startYear"=EXCLUDED."startYear", "endYear"=EXCLUDED."endYear"
  `, [r.id, r.profileId, r.institution, r.degree, r.fieldOfStudy||null, r.startYear||null, r.endYear||null]);
}
log(`  → ${edu.length} education`);

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
log('applications...');
const apps = await q('SELECT * FROM applications');
for (const r of apps) {
  await pgRun(`
    INSERT INTO applications (id, "jobId", "profileId", status, "coverNote", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, "coverNote"=EXCLUDED."coverNote"
  `, [r.id, r.jobId, r.profileId, r.status||'applied', r.coverNote||null, r.createdAt, r.updatedAt]);
}
log(`  → ${apps.length} applications`);

// ─── NOTIFICATION QUEUE (pending only, non-sensitive) ─────────────────────────
log('notificationQueue...');
const queue = await q('SELECT * FROM notificationQueue WHERE status IN ("pending","failed")');
for (const r of queue) {
  const payload = typeof r.payload === 'string' ? r.payload : JSON.stringify(r.payload);
  await pgRun(`
    INSERT INTO "notificationQueue" (id, "jobKey", channel, "recipientUserId", "eventType", subject, payload, status, "retryCount", "backoffUntil", "lastError", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (id) DO NOTHING
  `, [r.id, r.jobKey, r.channel, r.recipientUserId, r.eventType, r.subject||null,
      payload, r.status, r.retryCount||0, r.backoffUntil||null, r.lastError||null, r.createdAt, r.updatedAt]);
}
log(`  → ${queue.length} notificationQueue rows`);

// ─── Update sequences ─────────────────────────────────────────────────────────
log('Updating sequences...');
const tables = [
  'users','candidateProfiles','locations','skills','"skillAliases"',
  '"candidateSkills"','"workExperiences"','education',
  '"resumeSuggestions"','"profileDrafts"','companies','"companyMembers"',
  'jobs','"jobSkills"','applications','"applicationStageEvents"',
  '"profileViews"','messages','reports','"savedSearches"',
  '"notificationPreferences"','"unsubscribeTokens"','notifications',
  '"notificationQueue"','"emailSendLog"','"digestRuns"','"digestSent"'
];
for (const t of tables) {
  try {
    const clean = t.replace(/"/g,'');
    await pgRun(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE(MAX(id), 1)) FROM ${t}`);
  } catch(e) { /* skip if no sequence */ }
}

// ─── Verify counts ────────────────────────────────────────────────────────────
log('\nVERIFICATION COUNTS (PostgreSQL):');
const checkTables = ['users','candidateProfiles','locations','skills','"skillAliases"',
  '"candidateSkills"','"workExperiences"','education','companies','"companyMembers"',
  'jobs','"jobSkills"','applications'];
for (const t of checkTables) {
  const res = await dst.query(`SELECT COUNT(*) as n FROM ${t}`);
  log(`  ${t}: ${res.rows[0].n}`);
}

await src.end();
await dst.end();
log('\nMigration complete!');
