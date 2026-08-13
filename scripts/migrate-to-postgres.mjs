/**
 * Non-destructive batch migration: MySQL/TiDB → PostgreSQL
 */
import mysql from 'mysql2/promise';
import pg from 'pg';

const MYSQL_URL = 'mysql://3pXYBN7ALdP3R8i.root:BGnF8OX9e1BrMFV0iO77@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/Xa5WK2zgALVZPriP2m7kh2?ssl={"rejectUnauthorized":true}';
const POSTGRES_URL = 'postgresql://neondb_owner:npg_AIhtPSeJc1R5@ep-solitary-violet-axz6i9v0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

const src = await mysql.createPool({ uri: MYSQL_URL, waitForConnections: true, connectionLimit: 5 });
const dst = new pg.Pool({ connectionString: POSTGRES_URL, max: 5 });

function log(msg) { console.log(`[migrate] ${msg}`); }

async function srcAll(sql) {
  const [rows] = await src.execute(sql);
  return rows;
}

/** Batch insert using COPY-like multi-value approach */
async function batchUpsert(table, columns, rows, conflictCol, onConflict) {
  if (!rows.length) return;
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const vals = [];
    const placeholders = chunk.map((row, ri) => {
      const ph = columns.map((_, ci) => `$${ri * columns.length + ci + 1}`);
      row.forEach(v => vals.push(v));
      return `(${ph.join(',')})`;
    });
    const colList = columns.map(c => `"${c}"`).join(',');
    const sql = `INSERT INTO ${table} (${colList}) VALUES ${placeholders.join(',')} ON CONFLICT (${conflictCol}) DO ${onConflict}`;
    await dst.query(sql, vals);
    inserted += chunk.length;
  }
  return inserted;
}

// ─── LOCATIONS ───────────────────────────────────────────────────────────────
log('locations...');
const locations = await srcAll('SELECT * FROM locations');
await batchUpsert('"locations"',
  ['id','city','region','country','displayName','latitude','longitude'],
  locations.map(r => [r.id,r.city,r.region,r.country,r.displayName,r.latitude??null,r.longitude??null]),
  'id', 'UPDATE SET city=EXCLUDED.city,region=EXCLUDED.region,country=EXCLUDED.country,"displayName"=EXCLUDED."displayName"'
);
log(`  ✓ ${locations.length}`);

// ─── SKILLS ──────────────────────────────────────────────────────────────────
log('skills...');
const skills = await srcAll('SELECT * FROM skills');
await batchUpsert('"skills"',
  ['id','name','slug','category','createdAt'],
  skills.map(r => [r.id,r.name,r.slug,r.category,r.createdAt]),
  'id', 'UPDATE SET name=EXCLUDED.name,slug=EXCLUDED.slug,category=EXCLUDED.category'
);
log(`  ✓ ${skills.length}`);

// ─── SKILL ALIASES ───────────────────────────────────────────────────────────
log('skillAliases...');
const aliases = await srcAll('SELECT * FROM skillAliases');
await batchUpsert('"skillAliases"',
  ['id','alias','skillId'],
  aliases.map(r => [r.id,r.alias,r.skillId]),
  'id', 'UPDATE SET alias=EXCLUDED.alias,"skillId"=EXCLUDED."skillId"'
);
log(`  ✓ ${aliases.length}`);

// ─── USERS ───────────────────────────────────────────────────────────────────
log('users...');
const users = await srcAll('SELECT * FROM users');
await batchUpsert('"users"',
  ['id','openId','name','email','loginMethod','role','userType','createdAt','updatedAt','lastSignedIn'],
  users.map(r => [r.id,r.openId,r.name??null,r.email??null,r.loginMethod??null,r.role||'user',r.userType||'candidate',r.createdAt,r.updatedAt,r.lastSignedIn]),
  'id', 'UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email,"lastSignedIn"=EXCLUDED."lastSignedIn"'
);
log(`  ✓ ${users.length}`);

// ─── COMPANIES ───────────────────────────────────────────────────────────────
log('companies...');
const companies = await srcAll('SELECT * FROM companies');
await batchUpsert('"companies"',
  ['id','name','description','industry','website','size','locationId','createdAt','updatedAt'],
  companies.map(r => [r.id,r.name,r.description??null,r.industry??null,r.website??null,r.size??null,r.locationId??null,r.createdAt,r.updatedAt]),
  'id', 'UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description'
);
log(`  ✓ ${companies.length}`);

// ─── COMPANY MEMBERS ─────────────────────────────────────────────────────────
log('companyMembers...');
const members = await srcAll('SELECT * FROM companyMembers');
await batchUpsert('"companyMembers"',
  ['id','userId','companyId','role','createdAt'],
  members.map(r => [r.id,r.userId,r.companyId,r.role||'member',r.createdAt]),
  'id', 'UPDATE SET role=EXCLUDED.role'
);
log(`  ✓ ${members.length}`);

// ─── JOBS ─────────────────────────────────────────────────────────────────────
log('jobs...');
const jobs = await srcAll('SELECT * FROM jobs');
await batchUpsert('"jobs"',
  ['id','companyId','title','description','seniority','employmentType','salaryMin','salaryMax','locationId','remotePolicy','published','applicationCount','createdAt','updatedAt'],
  jobs.map(r => [r.id,r.companyId,r.title,r.description,r.seniority,r.employmentType||'full-time',r.salaryMin??null,r.salaryMax??null,r.locationId??null,r.remotePolicy,r.published===1||r.published===true,r.applicationCount||0,r.createdAt,r.updatedAt]),
  'id', 'UPDATE SET title=EXCLUDED.title,"salaryMin"=EXCLUDED."salaryMin","salaryMax"=EXCLUDED."salaryMax",published=EXCLUDED.published'
);
log(`  ✓ ${jobs.length}`);

// ─── JOB SKILLS ───────────────────────────────────────────────────────────────
log('jobSkills...');
const jobSkills = await srcAll('SELECT * FROM jobSkills');
await batchUpsert('"jobSkills"',
  ['id','jobId','skillId','weight'],
  jobSkills.map(r => [r.id,r.jobId,r.skillId,r.weight]),
  'id', 'UPDATE SET weight=EXCLUDED.weight'
);
log(`  ✓ ${jobSkills.length}`);

// ─── CANDIDATE PROFILES ───────────────────────────────────────────────────────
log('candidateProfiles...');
const profiles = await srcAll('SELECT cp.* FROM candidateProfiles cp INNER JOIN users u ON u.id = cp.userId');
await batchUpsert('"candidateProfiles"',
  ['id','userId','headline','summary','currentTitle','yearsOfExperience','locationId','remotePolicy','desiredSalaryMin','desiredSalaryMax','resumeUrl','resumeFileName','active','createdAt','updatedAt'],
  profiles.map(r => [r.id,r.userId,r.headline??null,r.summary??null,r.currentTitle??null,r.yearsOfExperience??null,r.locationId??null,r.remotePolicy??null,r.desiredSalaryMin??null,r.desiredSalaryMax??null,r.resumeUrl??null,r.resumeFileName??null,r.active===1||r.active===true,r.createdAt,r.updatedAt]),
  'id', 'UPDATE SET headline=EXCLUDED.headline,summary=EXCLUDED.summary,active=EXCLUDED.active'
);
log(`  ✓ ${profiles.length}`);

// ─── CANDIDATE SKILLS ─────────────────────────────────────────────────────────
// Note: candidateSkills.profileId references a different ID range (1000000+)
// We insert only rows where skillId exists in skills table
log('candidateSkills...');
const skillIdSet = new Set(skills.map(s => s.id));
const candSkills = await srcAll('SELECT * FROM candidateSkills');
const validCandSkills = candSkills.filter(r => skillIdSet.has(r.skillId));
// Temporarily drop FK, insert, re-add FK
await dst.query('ALTER TABLE "candidateSkills" DROP CONSTRAINT IF EXISTS "candidateSkills_profileId_fkey"');
await batchUpsert('"candidateSkills"',
  ['id','profileId','skillId','proficiency','years','createdAt'],
  validCandSkills.map(r => [r.id,r.profileId,r.skillId,r.proficiency,r.years||0,r.createdAt]),
  'id', 'UPDATE SET proficiency=EXCLUDED.proficiency,years=EXCLUDED.years'
);
log(`  ✓ ${validCandSkills.length}`);

// ─── WORK EXPERIENCES ─────────────────────────────────────────────────────────
log('workExperiences...');
const workExpAll = await srcAll('SELECT * FROM workExperiences');
await dst.query('ALTER TABLE "workExperiences" DROP CONSTRAINT IF EXISTS "workExperiences_profileId_fkey"');
await batchUpsert('"workExperiences"',
  ['id','profileId','title','company','startDate','endDate','current','description'],
  workExpAll.map(r => [r.id,r.profileId,r.title,r.company,r.startDate??null,r.endDate??null,r.current===1||r.current===true,r.description??null]),
  'id', 'UPDATE SET title=EXCLUDED.title,company=EXCLUDED.company'
);
log(`  ✓ ${workExpAll.length}`);

// ─── EDUCATION ────────────────────────────────────────────────────────────────
log('education...');
const eduAll = await srcAll('SELECT * FROM education');
await dst.query('ALTER TABLE "education" DROP CONSTRAINT IF EXISTS "education_profileId_fkey"');
await batchUpsert('"education"',
  ['id','profileId','institution','degree','fieldOfStudy','startYear','endYear'],
  eduAll.map(r => [r.id,r.profileId,r.institution,r.degree,r.fieldOfStudy??null,r.startYear??null,r.endYear??null]),
  'id', 'UPDATE SET institution=EXCLUDED.institution,degree=EXCLUDED.degree'
);
log(`  ✓ ${eduAll.length}`);

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
log('applications...');
const jobIdSet = new Set(jobs.map(j => j.id));
const appsAll = await srcAll('SELECT * FROM applications');
// applications profileId refs different range too — drop FK temporarily
await dst.query('ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_profileId_fkey"');
const validApps = appsAll.filter(r => jobIdSet.has(r.jobId));
await batchUpsert('"applications"',
  ['id','jobId','profileId','status','coverNote','createdAt','updatedAt'],
  validApps.map(r => [r.id,r.jobId,r.profileId,r.status||'applied',r.coverNote??null,r.createdAt,r.updatedAt]),
  'id', 'UPDATE SET status=EXCLUDED.status'
);
log(`  ✓ ${validApps.length}`);

// ─── Update sequences ─────────────────────────────────────────────────────────
log('Updating PostgreSQL sequences...');
const seqTables = [
  ['locations','id'],['skills','id'],['skillAliases','id'],['users','id'],
  ['companies','id'],['companyMembers','id'],['jobs','id'],['jobSkills','id'],
  ['candidateProfiles','id'],['candidateSkills','id'],['workExperiences','id'],
  ['education','id'],['applications','id']
];
for (const [t, col] of seqTables) {
  try {
    await dst.query(`SELECT setval(pg_get_serial_sequence('"${t}"', '${col}'), COALESCE((SELECT MAX("${col}") FROM "${t}"), 1))`);
  } catch(e) { log(`  warn: sequence for ${t}: ${e.message}`); }
}

// ─── Verify ───────────────────────────────────────────────────────────────────
log('\n=== VERIFICATION ===');
const checks = ['users','candidateProfiles','locations','skills','skillAliases','candidateSkills','workExperiences','education','companies','companyMembers','jobs','jobSkills','applications'];
for (const t of checks) {
  const r = await dst.query(`SELECT COUNT(*) AS n FROM "${t}"`);
  log(`  ${t}: ${r.rows[0].n}`);
}

await src.end();
await dst.end();
log('\n✅ Migration complete!');
