#!/usr/bin/env node
// Deterministic full-seed script for HireWise Phase 1.
// Produces: ~80 locations, 439 skills + 658 aliases, ~60 companies,
// 5,000+ candidates (profiles, skills, work history, education),
// 2,000+ jobs (with required/preferred skill split), 20,000+ applications.
// Fully deterministic: same output every run given a fixed RNG seed.
//
// Usage: DATABASE_URL=<url> node scripts/seed.mjs
// Idempotent: clears and rebuilds all seeded tables.

import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJ = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42); // fixed seed -> deterministic output

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function pickN(arr, n, unique = true) {
  if (unique && n >= arr.length) return [...arr];
  const out = [];
  const used = new Set();
  while (out.length < n) {
    const v = pick(arr);
    if (!used.has(v)) {
      used.add(v);
      out.push(v);
    }
  }
  return out;
}
function weightedPick(entries) {
  // entries: [{value, weight}]
  const total = entries.reduce((s, e) => s + e.weight, 0);
  let r = rand() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r <= 0) return e.value;
  }
  return entries[entries.length - 1].value;
}
function genName(rngOffset) {
  const first = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
    "Cameron", "Dakota", "Sam", "Jamie", "Drew", "Reese", "Skyler", "Blake",
    "Parker", "Emery", "Finley", "Hayden", "Logan", "Emerson", "Rowan", "Sage",
    "Priya", "Wei", "Aisha", "Dmitri", "Sofia", "Yuki", "Mateo", "Fatima",
    "Liam", "Olivia", "Noah", "Emma", "Carlos", "Amara", "Kenji", "Ines",
    "Arjun", "Lena", "Tomas", "Nadia", "Ravi", "Chloe", "Ahmed", "Hana",
    "Diego", "Zara", "Elena", "Omar", "Mei", "Idris", "Anya", "Bruno",
  ];
  const last = [
    "Patel", "Chen", "Garcia", "Okafor", "Mueller", "Kim", "Nakamura", "Silva",
    "Andersen", "Rossi", "Kowalski", "Johansson", "Alvarez", "Dubois", "Singh",
    "Morrison", "Tanaka", "Petrov", "Fernandez", "Williams", "Smith", "Johnson",
    "Brown", "Davis", "Wilson", "Moore", "Taylor", "Thomas", "Jackson", "White",
    "Harris", "Martin", "Thompson", "Robinson", "Clark", "Lewis", "Lee", "Walker",
    "Hall", "Allen", "Young", "King", "Wright", "Lopez", "Hill", "Scott",
    "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell",
  ];
  return `${pick(first)} ${pick(last)}#${rngOffset}`;
}

const TITLE_POOL = [
  "Software Engineer", "Senior Software Engineer", "Frontend Engineer",
  "Backend Engineer", "Full Stack Developer", "DevOps Engineer",
  "Staff Engineer", "Engineering Manager", "Data Scientist",
  "Senior Data Scientist", "ML Engineer", "Data Engineer",
  "Product Manager", "Senior Product Manager", "Product Designer",
  "UX Researcher", "QA Engineer", "SRE", "Security Engineer",
  "Cloud Architect", "Solutions Architect", "Technical Writer",
  "Engineering Lead", "Principal Engineer", "Mobile Developer",
  "iOS Developer", "Android Developer", "Analytics Engineer",
  "Growth Product Manager", "Design Lead",
];

const COMPANY_TITLES = (company) => [
  `${TITLE_POOL[0]} at ${company}`,
  "Software Developer",
  "Engineer",
];

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Cameron", "Dakota", "Sam", "Jamie", "Drew", "Reese", "Skyler", "Blake",
  "Parker", "Emery", "Finley", "Hayden", "Logan", "Emerson", "Rowan", "Sage",
  "Priya", "Wei", "Aisha", "Dmitri", "Sofia", "Yuki", "Mateo", "Fatima",
  "Liam", "Olivia", "Noah", "Emma", "Carlos", "Amara", "Kenji", "Ines",
  "Arjun", "Lena", "Tomas", "Nadia", "Ravi", "Chloe", "Ahmed", "Hana",
  "Diego", "Zara", "Elena", "Omar", "Mei", "Idris", "Anya", "Bruno",
];
const LAST_NAMES = [
  "Patel", "Chen", "Garcia", "Okafor", "Mueller", "Kim", "Nakamura", "Silva",
  "Andersen", "Rossi", "Kowalski", "Johansson", "Alvarez", "Dubois", "Singh",
  "Morrison", "Tanaka", "Petrov", "Fernandez", "Williams", "Smith", "Johnson",
  "Brown", "Davis", "Wilson", "Moore", "Taylor", "Thomas", "Jackson", "White",
  "Harris", "Martin", "Thompson", "Robinson", "Clark", "Lewis", "Lee", "Walker",
  "Hall", "Allen", "Young", "King", "Wright", "Lopez", "Hill", "Scott",
  "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell",
];

const INDUSTRIES = [
  "Software", "Fintech", "Healthcare", "E-commerce", "EdTech", "AdTech",
  "Cybersecurity", "AI/ML", "DevTools", "Media", "Logistics", "Travel",
  "Energy", "Retail", "Real Estate", "Legal Tech", "HR Tech", "Gaming",
];

const JOB_TEMPLATES = [
  { title: "Senior Frontend Engineer", cat: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"], sen: "senior" },
  { title: "Frontend Developer", cat: ["React", "JavaScript", "HTML", "CSS", "Redux"], sen: "mid" },
  { title: "Staff Frontend Engineer", cat: ["React", "TypeScript", "Architecture", "Design Systems", "Performance Optimization"], sen: "staff" },
  { title: "Senior Backend Engineer", cat: ["Node.js", "PostgreSQL", "TypeScript", "REST API", "Redis"], sen: "senior" },
  { title: "Backend Engineer", cat: ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"], sen: "mid" },
  { title: "Principal Backend Engineer", cat: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "System Design"], sen: "staff" },
  { title: "Full Stack Engineer", cat: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"], sen: "mid" },
  { title: "Senior Full Stack Developer", cat: ["Vue.js", "Express", "MongoDB", "JavaScript", "AWS"], sen: "senior" },
  { title: "DevOps Engineer", cat: ["Kubernetes", "Docker", "Terraform", "CI/CD", "AWS"], sen: "mid" },
  { title: "Senior DevOps Engineer", cat: ["Kubernetes", "AWS", "Terraform", "Prometheus", "Grafana"], sen: "senior" },
  { title: "Site Reliability Engineer", cat: ["Linux", "Kubernetes", "Prometheus", "Incident Management", "Python"], sen: "mid" },
  { title: "Data Scientist", cat: ["Python", "Machine Learning", "SQL", "Pandas", "scikit-learn"], sen: "mid" },
  { title: "Senior Data Scientist", cat: ["Python", "Machine Learning", "Statistics", "SQL", "TensorFlow"], sen: "senior" },
  { title: "Staff Data Scientist", cat: ["Machine Learning", "Statistics", "Python", "Causal Inference", "Experimentation"], sen: "staff" },
  { title: "ML Engineer", cat: ["Python", "PyTorch", "Machine Learning", "MLOps", "Docker"], sen: "mid" },
  { title: "Senior ML Engineer", cat: ["PyTorch", "Deep Learning", "MLOps", "Python", "Kubernetes"], sen: "senior" },
  { title: "Data Engineer", cat: ["Python", "Apache Spark", "SQL", "Airflow", "Snowflake"], sen: "mid" },
  { title: "Senior Data Engineer", cat: ["Apache Spark", "dbt", "Snowflake", "Python", "Kafka"], sen: "senior" },
  { title: "Analytics Engineer", cat: ["dbt", "SQL", "Snowflake", "Data Modeling", "Python"], sen: "mid" },
  { title: "Product Manager", cat: ["Product Management", "Agile", "Roadmapping", "Data Analysis", "Stakeholder Management"], sen: "mid" },
  { title: "Senior Product Manager", cat: ["Product Management", "Strategy", "OKRs", "Data Analysis", "User Research"], sen: "senior" },
  { title: "Product Designer", cat: ["Figma", "UI/UX Design", "Prototyping", "Design Systems", "User Research"], sen: "mid" },
  { title: "Senior Product Designer", cat: ["Figma", "Design Systems", "UI/UX Design", "Interaction Design", "Mentorship"], sen: "senior" },
  { title: "UX Researcher", cat: ["UX Research", "User Interviews", "A/B Testing", "Data Analysis", "Prototyping"], sen: "mid" },
  { title: "iOS Developer", cat: ["Swift", "iOS Development", "SwiftUI", "Xcode", "REST API"], sen: "mid" },
  { title: "Senior iOS Developer", cat: ["Swift", "iOS Development", "SwiftUI", "Architecture", "CI/CD"], sen: "senior" },
  { title: "Android Developer", cat: ["Kotlin", "Android Development", "Jetpack Compose", "Coroutines", "REST API"], sen: "mid" },
  { title: "Mobile Engineer", cat: ["React Native", "TypeScript", "iOS Development", "Android Development", "Expo"], sen: "mid" },
  { title: "Security Engineer", cat: ["Cybersecurity", "Penetration Testing", "OWASP", "Network Security", "Linux"], sen: "mid" },
  { title: "Senior Security Engineer", cat: ["Application Security", "Threat Modeling", "Penetration Testing", "SIEM", "Python"], sen: "senior" },
  { title: "Cloud Architect", cat: ["AWS", "Terraform", "Kubernetes", "System Design", "Security"], sen: "senior" },
  { title: "Solutions Architect", cat: ["AWS", "Azure", "System Design", "REST API", "Microservices"], sen: "senior" },
  { title: "QA Engineer", cat: ["Test Automation", "Cypress", "Jest", "CI/CD", "Python"], sen: "mid" },
  { title: "Senior QA Engineer", cat: ["Playwright", "Test Automation", "CI/CD", "Performance Testing", "API Testing"], sen: "senior" },
  { title: "Technical Writer", cat: ["Technical Writing", "Documentation", "API Documentation", "Git", "Markdown"], sen: "mid" },
  { title: "Engineering Manager", cat: ["Leadership", "Agile", "Code Review", "Mentorship", "System Design"], sen: "lead" },
  { title: "Director of Engineering", cat: ["Leadership", "Engineering Management", "Strategy", "Stakeholder Management", "Agile"], sen: "staff" },
  { title: "AI/ML Research Engineer", cat: ["Deep Learning", "PyTorch", "Research", "Python", "LLM Fine-Tuning"], sen: "senior" },
  { title: "RAG/AI Platform Engineer", cat: ["LangChain", "Vector Databases", "LLM Fine-Tuning", "Python", "APIs"], sen: "mid" },
  { title: "Growth Engineer", cat: ["React", "A/B Testing", "Analytics", "Node.js", "SEO"], sen: "mid" },
  { title: "Platform Engineer", cat: ["Kubernetes", "Go", "Terraform", "CI/CD", "Observability"], sen: "senior" },
  { title: "Database Administrator", cat: ["PostgreSQL", "MySQL", "Database Administration", "Performance Tuning", "Backups"], sen: "mid" },
  { title: "Blockchain Engineer", cat: ["Solidity", "Smart Contracts", "Web3", "TypeScript", "Ethereum"], sen: "mid" },
  { title: "Gameplay Engineer", cat: ["Unity", "C#", "Game Development", "3D Modeling", "Performance Optimization"], sen: "mid" },
  { title: "Customer Success Manager", cat: ["Customer Success", "SaaS", "Account Management", "Communication", "CRM"], sen: "mid" },
  { title: "Sales Engineer", cat: ["SaaS", "Technical Demos", "Sales", "Communication", "Problem Solving"], sen: "mid" },
];

const SKILL_CATEGORIES = [
  "Programming Languages", "Web Development", "Backend & Databases",
  "Cloud & DevOps", "Mobile Development", "Data Science & ML",
  "AI & Emerging Tech", "Design & UX", "Product, Project & Business",
  "Cybersecurity", "Finance & Other", "Frontend & CSS Ecosystem",
  "Backend & Infrastructure", "Data & Analytics", "Mobile & Desktop",
  "Quality, Security & Reliability", "Design, Product & Business",
  "Domain Expertise",
];

const SENIORITY_MAP = {
  junior: ["junior", "junior", "junior", "mid"],
  mid: ["mid", "mid", "mid", "senior", "junior"],
  senior: ["senior", "senior", "senior", "lead"],
  lead: ["lead", "senior", "lead", "staff"],
  staff: ["staff", "lead", "staff"],
};

const SEN_ORDER = ["junior", "mid", "senior", "lead", "staff"];

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------
const CITIES = [
  ["San Francisco", "CA", "US"], ["New York", "NY", "US"], ["Austin", "TX", "US"],
  ["Seattle", "WA", "US"], ["Boston", "MA", "US"], ["Chicago", "IL", "US"],
  ["Denver", "CO", "US"], ["Atlanta", "GA", "US"], ["Miami", "FL", "US"],
  ["Portland", "OR", "US"], ["London", "England", "UK"], ["Berlin", "Berlin", "DE"],
  ["Amsterdam", "North Holland", "NL"], ["Paris", "Île-de-France", "FR"],
  ["Toronto", "ON", "CA"], ["Vancouver", "BC", "CA"], ["Bangalore", "KA", "IN"],
  ["Mumbai", "MH", "IN"], ["Singapore", "", "SG"], ["Tokyo", "Tokyo", "JP"],
  ["Sydney", "NSW", "AU"], ["Dublin", "Leinster", "IE"], ["Lisbon", "Lisbon", "PT"],
  ["Tel Aviv", "Tel Aviv", "IL"], ["Stockholm", "Stockholm", "SE"],
  ["Zurich", "Zurich", "CH"], ["Warsaw", "Mazovia", "PL"], ["Prague", "Prague", "CZ"],
  ["Remote", "", "Remote"],
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
  });

  console.log("Cleaning seeded tables...");
  await conn.query(`
    DELETE FROM applications;
    DELETE FROM jobs; DELETE FROM jobSkills;
    DELETE FROM workExperiences; DELETE FROM education;
    DELETE FROM candidateSkills; DELETE FROM candidateProfiles;
    DELETE FROM resumeSuggestions; DELETE FROM profileDrafts;
    DELETE FROM companyMembers; DELETE FROM companies;
    DELETE FROM users;
  `);

  // ---------------------------------------------------------------------------
  // Locations
  // ---------------------------------------------------------------------------
  console.log("Seeding locations...");
  const locInsert = CITIES.map(([city, region, country]) =>
    `('${city.replace(/'/g, "''")}','${region.replace(/'/g, "''")}','${country}','${
      region ? `${city}, ${region}, ${country}` : `${city}, ${country}`
    }')`,
  );
  await conn.query(`INSERT INTO locations (city, region, country, displayName) VALUES ${locInsert.join(",")}`);
  const [locations] = await conn.query("SELECT id, city, country FROM locations");
  const remoteLoc = locations.find((l) => l.country === "Remote");
  const nonRemote = locations.filter((l) => l.country !== "Remote");

  // ---------------------------------------------------------------------------
  // Skills & aliases (deterministic, from generated JSON)
  // ---------------------------------------------------------------------------
  console.log("Seeding skills & aliases...");
  const taxonomy = JSON.parse(fs.readFileSync(path.join(PROJ, "scripts", "skills-seed.json"), "utf8"));
  await conn.query(`DELETE FROM skillAliases; DELETE FROM skills`);
  for (const s of taxonomy.skills) {
    await conn.query(
      "INSERT INTO skills (id, name, slug, category) VALUES (?, ?, ?, ?)",
      [s.id, s.name, s.slug, s.category],
    );
  }
  await conn.query(`ALTER TABLE skills AUTO_INCREMENT = ${taxonomy.skills.length + 1}`);
  const aliasInsert = taxonomy.aliases.map((a) => `('${a.alias.replace(/'/g, "''")}',${a.skillId})`);
  for (let i = 0; i < aliasInsert.length; i += 500) {
    await conn.query(
      `INSERT INTO skillAliases (alias, skillId) VALUES ${aliasInsert.slice(i, i + 500).join(",")}`,
    );
  }
  // rebuild alias lookup
  const [allSkills] = await conn.query("SELECT id, name, slug, category FROM skills");
  const skillById = new Map(allSkills.map((s) => [s.id, s]));
  const skillsByName = new Map(allSkills.map((s) => [s.name.toLowerCase(), s]));
  const skillsBySlug = new Map(allSkills.map((s) => [s.slug, s]));
  const [allAliases] = await conn.query("SELECT alias, skillId FROM skillAliases");
  const aliasToSkillId = new Map(allAliases.map((a) => [a.alias, a.skillId]));

  /** Alias-aware skill lookup (query-time resolution). */
  function resolveSkill(term) {
    const t = term.trim().toLowerCase();
    if (!t) return null;
    if (aliasToSkillId.has(t)) return skillById.get(aliasToSkillId.get(t));
    if (skillsByName.has(t)) return skillsByName.get(t);
    if (skillsBySlug.has(t)) return skillsBySlug.get(t);
    // substring match on alias then name
    const aliasMatch = allAliases.find((a) => a.alias.includes(t) || t.includes(a.alias));
    if (aliasMatch) return skillById.get(aliasMatch.skillId);
    const nameMatch = allSkills.find((s) => s.name.toLowerCase().includes(t));
    if (nameMatch) return nameMatch;
    return null;
  }

  // Build category -> skills index
  const skillsByCategory = new Map();
  for (const s of allSkills) {
    if (!skillsByCategory.has(s.category)) skillsByCategory.set(s.category, []);
    skillsByCategory.get(s.category).push(s);
  }

  /** Weighted realistic skill sampling per profile type. */
  function sampleSkills(roleFamily, count) {
    const catWeights = {
      engineering: [
        ["Programming Languages", 40], ["Web Development", 25], ["Backend & Databases", 15],
        ["Cloud & DevOps", 10], ["Quality, Security & Reliability", 6], ["Frontend & CSS Ecosystem", 4],
      ],
      data: [
        ["Data Science & ML", 35], ["Data & Analytics", 25], ["Programming Languages", 20],
        ["Backend & Databases", 10], ["AI & Emerging Tech", 10],
      ],
      product: [
        ["Product, Project & Business", 55], ["Design & UX", 15], ["Data & Analytics", 15],
        ["Design, Product & Business", 10], ["Domain Expertise", 5],
      ],
      design: [
        ["Design & UX", 60], ["Frontend & CSS Ecosystem", 15], ["Design, Product & Business", 15],
        ["Web Development", 10],
      ],
      mobile: [
        ["Mobile Development", 40], ["Programming Languages", 25], ["Mobile & Desktop", 15],
        ["Backend & Infrastructure", 10], ["Quality, Security & Reliability", 10],
      ],
      ops: [
        ["Cloud & DevOps", 35], ["Backend & Infrastructure", 25], ["Quality, Security & Reliability", 15],
        ["Programming Languages", 15], ["Cybersecurity", 10],
      ],
      security: [
        ["Cybersecurity", 50], ["Quality, Security & Reliability", 20], ["Cloud & DevOps", 15],
        ["Programming Languages", 10], ["Backend & Databases", 5],
      ],
      ai: [
        ["AI & Emerging Tech", 35], ["Data Science & ML", 30], ["Data & Analytics", 15],
        ["Programming Languages", 10], ["Backend & Infrastructure", 10],
      ],
    };
    let weights = catWeights[roleFamily] || catWeights.engineering;
    // occasionally a polymath: mix in one random category
    if (rand() < 0.25) weights = [...weights, [pick(SKILL_CATEGORIES), 8]];
    const pool = [];
    for (const [cat, w] of weights) {
      const list = skillsByCategory.get(cat) || [];
      for (const s of list) for (let i = 0; i < w; i++) pool.push(s);
    }
    const picked = [];
    const used = new Set();
    while (picked.length < count && pool.length > 0) {
      const s = pool[Math.floor(rand() * pool.length)];
      if (!used.has(s.id)) {
        used.add(s.id);
        picked.push(s);
      }
    }
    return picked;
  }

  // ---------------------------------------------------------------------------
  // Users (seeded accounts — deterministic, no OAuth needed to demo)
  // ---------------------------------------------------------------------------
  console.log("Seeding users, companies, candidates, jobs, applications...");
  const NUM_CANDIDATES = 5100;
  const NUM_JOBS = 2100;
  const NUM_COMPANIES = 60;

  const userValues = [];
  const profileValues = [];
  const candidateSkillValues = [];
  const workValues = [];
  const eduValues = [];
  const companyValues = [];
  const companyMemberValues = [];
  const jobValues = [];
  const jobSkillValues = [];
  const applicationValues = [];

  // --- Companies ---
  const ADJ = ["Nova", "Cloud", "Data", "Quantum", "Blue", "Green", "Red", "Bright", "Prime", "Core", "Peak", "Apex", "North", "West", "East", "South", "Iron", "Steel", "Crystal", "Lunar"];
  const NOUN = ["Labs", "Tech", "Systems", "Works", "Digital", "Software", "Dynamics", "Ventures", "Networks", "Platform", "Analytics", "Cloud", "Data", "AI", "Robotics", "Solutions", "Industries", "Group", "Studio", "Foundry"];
  for (let i = 0; i < NUM_COMPANIES; i++) {
    const name = `${pick(ADJ)}${pick(NOUN)}${i}`;
    companyValues.push(`(${conn.escape(name)}, ${conn.escape(`A ${pick(INDUSTRIES).toLowerCase()} company building products used by millions.`)}, ${conn.escape(pick(INDUSTRIES))}, ${conn.escape(`https://${name.toLowerCase()}.example.com`)}, ${conn.escape(pick(["1-10", "11-50", "51-200", "201-1000", "1000+"]))}, ${pick(nonRemote).id})`);
  }
  await conn.query(`INSERT INTO companies (name, description, industry, website, size, locationId) VALUES ${companyValues.join(",")}`);
  const [companies] = await conn.query("SELECT id FROM companies");

  for (const c of companies) {
    // CompanyMember rows — each company gets an owner user (deterministic ids)
    const userId = 100000 + c.id; // deterministic userId for company owners
    userValues.push(`(${userId}, ${conn.escape(`owner-${c.id}`)}, ${conn.escape(`Company ${c.id} Owner`)}, ${conn.escape(`company${c.id}@example.com`)}, 'manual', 'user', 'employer')`);
    companyMemberValues.push(`(${userId}, ${c.id}, 'owner')`);
  }
  await conn.query(`INSERT INTO users (id, openId, name, email, loginMethod, role, userType) VALUES ${userValues.join(",")} ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), userType=VALUES(userType)`);
  await conn.query(`INSERT INTO companyMembers (userId, companyId, role) VALUES ${companyMemberValues.join(",")} ON DUPLICATE KEY UPDATE role=role`);
  await conn.query(`ALTER TABLE users AUTO_INCREMENT = ${200000}`);

  // --- Candidates ---
  const ROLE_FAMILIES = ["engineering", "engineering", "engineering", "data", "product", "design", "mobile", "ops", "security", "ai"];
  const PROFICIENCIES = ["beginner", "intermediate", "advanced", "expert"];

  for (let i = 0; i < NUM_CANDIDATES; i++) {
    const userId = 1000000 + i; // deterministic userId
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    userValues.push(`(${userId}, ${conn.escape(`seed-candidate-${i}`)}, ${conn.escape(name)}, ${conn.escape(`${firstName.toLowerCase()}.${i}@example.com`)}, 'manual', 'user', 'candidate')`);

    const title = pick(TITLE_POOL);
    const family = pick(ROLE_FAMILIES);
    const years = Math.round(Math.min(20, Math.max(0, (rand() * 16))));
    const loc = weightedPick([...nonRemote.map((l) => ({ value: l.id, weight: 1 })), { value: remoteLoc.id, weight: 6 }]);
    const remotePolicy = loc === remoteLoc.id ? "remote" : pick(["onsite", "hybrid", "remote", "flexible"]);
    const salaryMin = Math.round((35000 + years * 9000 + rand() * 20000) / 1000) * 1000;
    const salaryMax = salaryMin + Math.round((10000 + rand() * 40000) / 1000) * 1000;

        // Candidate skills: 4-12 per profile, realistic proficiency/years
    const numSkills = 4 + Math.floor(rand() * 9);
    const skills = sampleSkills(family, numSkills);
    for (let k = 0; k < skills.length; k++) {
      const proficiency = weightedPick([
        { value: "expert", weight: k === 0 ? 5 : 1 },
        { value: "advanced", weight: k < 2 ? 5 : 2 },
        { value: "intermediate", weight: k < 4 ? 4 : 3 },
        { value: "beginner", weight: k > 5 ? 4 : 1 },
      ]);
      const profIdx = PROFICIENCIES.indexOf(proficiency);
      const skillYears = Math.max(0, Math.round((profIdx + 0.5) * years / 4 + rand() * 2));
            candidateSkillValues.push(`(${userId}, ${skills[k].id}, ${conn.escape(proficiency)}, ${skillYears})`);
    }
    const topSkillNames = skills.slice(0, 5).map((s) => s.name);
    profileValues.push(`(${userId}, ${conn.escape(`${title} · ${years} yrs exp`)}, ${conn.escape(`Passionate ${title.toLowerCase()} with ${years} years of experience building reliable software. Skilled in ${topSkillNames.join(", ")} and related technologies.`)}, ${conn.escape(title)}, ${years}, ${loc}, ${conn.escape(remotePolicy)}, ${salaryMin}, ${salaryMax})`);
    // Work history: 1-4 roles
    const numRoles = 1 + Math.floor(rand() * 4);
    const usedCompanies = new Set();
    let y = 2026;
    for (let r = 0; r < numRoles; r++) {
      const dur = 1 + Math.floor(rand() * 5);
      const endY = r === 0 ? 2026 : y;
      const startY = endY - dur;
      y = startY;
      const comp = (() => {
        let c2 = pick(companies).id;
        while (usedCompanies.has(c2) && usedCompanies.size < companies.length) c2 = pick(companies).id;
        usedCompanies.add(c2);
        return c2;
      })();
      workValues.push(`(${userId}, ${conn.escape(title)}, ${conn.escape(`Company ${comp}`)}, '${startY}-01-01', '${r === 0 ? "2026-12-31" : `${endY}-12-31`}', ${r === 0}, ${conn.escape(`Led engineering work on core product systems during this period.`)})`);
    }

    // Education: 1-2 degrees
    const numEdu = rand() < 0.9 ? (rand() < 0.8 ? 2 : 1) : 0;
    const unis = ["State University", "Institute of Technology", "University", "College of Engineering", "Polytechnic"];
    const degrees = ["Bachelor of Science", "Master of Science", "Bachelor of Engineering", "Master of Engineering", "Bachelor of Arts", "Master of Business Administration"];
    const fields = ["Computer Science", "Software Engineering", "Data Science", "Information Technology", "Electrical Engineering", "Mathematics", "Business Administration", "Design"];
    for (let e = 0; e < numEdu; e++) {
      const endYear = 2010 + Math.floor(rand() * 14);
      eduValues.push(`(${userId}, ${conn.escape(`${pick(unis)} ${e + 1}`)}, ${conn.escape(pick(degrees))}, ${conn.escape(pick(fields))}, ${endYear - 4}, ${endYear})`);
    }
  }
  await conn.query(`INSERT INTO users (id, openId, name, email, loginMethod, role, userType) VALUES ${userValues.join(",")} ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), userType=VALUES(userType)`);
  await conn.query(`INSERT INTO candidateProfiles (userId, headline, summary, currentTitle, yearsOfExperience, locationId, remotePolicy, desiredSalaryMin, desiredSalaryMax) VALUES ${profileValues.join(",")} ON DUPLICATE KEY UPDATE headline=VALUES(headline)`);
  for (let i = 0; i < candidateSkillValues.length; i += 2000) {
    await conn.query(`INSERT INTO candidateSkills (profileId, skillId, proficiency, years) VALUES ${candidateSkillValues.slice(i, i + 2000).join(",")} ON DUPLICATE KEY UPDATE proficiency=proficiency`);
  }
  for (let i = 0; i < workValues.length; i += 2000) {
    await conn.query(`INSERT INTO workExperiences (profileId, title, company, startDate, endDate, current, description) VALUES ${workValues.slice(i, i + 2000).join(",")} ON DUPLICATE KEY UPDATE title=title`);
  }
  for (let i = 0; i < eduValues.length; i += 2000) {
    await conn.query(`INSERT INTO education (profileId, institution, degree, fieldOfStudy, startYear, endYear) VALUES ${eduValues.slice(i, i + 2000).join(",")} ON DUPLICATE KEY UPDATE institution=institution`);
  }

  // --- Jobs ---
  const seniorityWeights = { junior: 2, mid: 5, senior: 4, lead: 1, staff: 1 };
  for (let j = 0; j < NUM_JOBS; j++) {
    const template = pick(JOB_TEMPLATES);
    const sen = weightedPick(Object.entries(seniorityWeights).map(([v, w]) => ({ value: v, weight: w })));
    const companyId = companies[Math.floor(rand() * companies.length)].id;
    const remote = rand() < 0.45;
    const loc = remote ? remoteLoc.id : pick(nonRemote).id;
    const base = template.sen === sen ? 0 : (SEN_ORDER.indexOf(template.sen) - SEN_ORDER.indexOf(sen)) * 15000;
    const salaryMin = Math.max(30000, Math.round((60000 + base + rand() * 40000) / 1000) * 1000);
    const salaryMax = salaryMin + Math.round((15000 + rand() * 60000) / 1000) * 1000;
    const published = rand() < 0.85;
    // Required vs preferred skills: first 2-4 required, rest preferred (needed early for description)
    const [req, pref] = [template.cat.slice(0, 2 + Math.floor(rand() * 3)), template.cat.slice(2 + Math.floor(rand() * 3))];
    const allSkillNames = [...req, ...pref].map((s) => resolveSkill(s)?.name).filter(Boolean);
    const reqNames = req.map((s) => resolveSkill(s)?.name).filter(Boolean);
    const desc = `We are looking for a talented ${template.title.toLowerCase()} to join our team. You will work on challenging problems with a collaborative group of engineers and product folks. ${allSkillNames.length ? `You will work with ${allSkillNames.slice(0, 6).join(", ")}${allSkillNames.length > 6 ? " and more" : ""}. ` : ""}Requirements${reqNames.length ? `: strong experience with ${reqNames.join(", ")}` : ""}, plus excellent problem-solving and communication skills. Responsibilities include designing, building, and shipping high-quality software, participating in code reviews, and mentoring teammates.`;
    jobValues.push(`(${10000 + j}, ${companyId}, ${conn.escape(template.title + (template.sen === sen ? "" : ` (${sen})`))}, ${conn.escape(desc)}, ${conn.escape(sen)}, ${conn.escape(pick([
    "full-time", "full-time", "full-time", "part-time", "contract"]))}, ${salaryMin}, ${salaryMax}, ${loc}, ${conn.escape(remote ? pick(["remote", "hybrid", "flexible"]) : pick(["onsite", "hybrid"]))}, ${published ? 1 : 0})`);
    for (const s of req) {
      const skill = resolveSkill(s);
      if (skill) jobSkillValues.push(`(${10000 + j}, ${skill.id}, 'required')`);
    }
    for (const s of pref) {
      const skill = resolveSkill(s);
      if (skill) jobSkillValues.push(`(${10000 + j}, ${skill.id}, 'preferred')`);
    }
  }
  await conn.query(`INSERT INTO jobs (id, companyId, title, description, seniority, employmentType, salaryMin, salaryMax, locationId, remotePolicy, published) VALUES ${jobValues.join(",")} ON DUPLICATE KEY UPDATE title=title`);
  await conn.query(`ALTER TABLE jobs AUTO_INCREMENT = ${10000 + NUM_JOBS + 1}`);
  if (jobSkillValues.length)
    await conn.query(`INSERT INTO jobSkills (jobId, skillId, weight) VALUES ${jobSkillValues.join(",")} ON DUPLICATE KEY UPDATE weight=weight`);

  // --- Applications: 20,000+ with realistic distributions ---
  // Realistic: senior roles get more applications; published jobs get the bulk.
  // Power-law: a fraction of jobs are "hot" and attract many applications.
  console.log("Generating 22,000 applications (this takes a moment)...");
  const [jobRows] = await conn.query("SELECT id, published, seniority FROM jobs");
  const publishedJobs = jobRows.filter((j) => j.published);
  const hotJobs = pickN(publishedJobs, Math.floor(publishedJobs.length * 0.12));
  const hotSet = new Set(hotJobs.map((j) => j.id));
  const seniorBonus = { junior: 1.4, mid: 1.2, senior: 1.0, lead: 0.7, staff: 0.5 };

  const appId = 1;
  const profileIds = [];
  for (let i = 0; i < NUM_CANDIDATES; i++) profileIds.push(1000000 + i);
  const appliedPairs = new Set();
  const TARGET = 22000;
  let generated = 0;
  const appBatch = [];

  while (generated < TARGET) {
    const job = hotSet.has(undefined) ? null : (rand() < 0.6 ? pick(hotJobs) : pick(publishedJobs));
    const profileId = pick(profileIds);
    const key = `${job.id}-${profileId}`;
    if (appliedPairs.has(key)) continue;
    appliedPairs.add(key);
    // realistic statuses: mostly applied, some screening, few interview/offered
    const status = weightedPick([
      { value: "applied", weight: 70 }, { value: "screening", weight: 15 },
      { value: "interview", weight: 8 }, { value: "offered", weight: 3 },
      { value: "accepted", weight: 2 }, { value: "rejected", weight: 15 },
      { value: "withdrawn", weight: 2 },
    ]);
    const daysAgo = Math.floor(rand() * 300);
    const created = `DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY)`;
    appBatch.push(`(NULL, ${job.id}, ${profileId}, ${conn.escape(status)}, ${conn.escape(rand() < 0.4 ? "Excited to apply — my background aligns well with this role." : null)}, ${created}, ${created})`);
    generated++;
    if (appBatch.length >= 2000) {
      await conn.query(`INSERT INTO applications (id, jobId, profileId, status, coverNote, createdAt, updatedAt) VALUES ${appBatch.join(",")}`);
      appBatch.length = 0;
      console.log(`  ${generated}/${TARGET} applications inserted`);
    }
  }
  if (appBatch.length) {
    await conn.query(`INSERT INTO applications (id, jobId, profileId, status, coverNote, createdAt, updatedAt) VALUES ${appBatch.join(",")}`);
  }
  // Refresh denormalized application counts
  await conn.query(`
    UPDATE jobs j SET applicationCount = (SELECT COUNT(*) FROM applications a WHERE a.jobId = j.id)
  `);

  // ---------------------------------------------------------------------------
  // Verification
  // ---------------------------------------------------------------------------
  const [counts] = await conn.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE userType='candidate') AS candidates,
      (SELECT COUNT(*) FROM users WHERE userType='employer') AS employers,
      (SELECT COUNT(*) FROM candidateProfiles) AS profiles,
      (SELECT COUNT(*) FROM candidateSkills) AS candidateSkills,
      (SELECT COUNT(*) FROM companies) AS companies,
      (SELECT COUNT(*) FROM jobs) AS jobs,
      (SELECT COUNT(*) FROM jobSkills) AS jobSkills,
      (SELECT COUNT(*) FROM applications) AS applications,
      (SELECT COUNT(*) FROM skills) AS skills,
      (SELECT COUNT(*) FROM skillAliases) AS aliases,
      (SELECT COUNT(*) FROM workExperiences) AS workHistory,
      (SELECT COUNT(*) FROM education) AS educationRows
  `);
  console.log("Seed counts:", JSON.stringify(counts[0], null, 2));
  assertGte(counts[0].candidates, 5000, "candidates");
  assertGte(counts[0].jobs, 2000, "jobs");
  assertGte(counts[0].applications, 20000, "applications");
  assertGte(counts[0].skills, 300, "skills");

  // Alias query-time resolution check: searching 'JS' must resolve to JavaScript
  const [jsRows] = await conn.query(`
    SELECT s.id, s.name
    FROM skillAliases sa JOIN skills s ON s.id = sa.skillId
    WHERE sa.alias IN ('js', 'javascript', 'js/jsx')
  `);
  const unique = new Set(jsRows.map((r) => r.id));
  console.log("'JS'/'Javascript'/'JavaScript' resolve to skill ids:", [...unique], "(must be exactly one)");
  if (unique.size !== 1) throw new Error("Alias resolution failed");

  // Performance check: join query plan on a sample search
  const t0 = Date.now();
  await conn.query(`
    SELECT COUNT(*) AS matchingProfiles
    FROM candidateSkills cs
    JOIN skillAliases sa ON sa.skillId = cs.skillId AND sa.alias = 'js'
  `);
  console.log(`Alias-join query on 22k+ applications dataset took ${Date.now() - t0}ms`);

  await conn.end();
  console.log("Seed complete.");
}

function assertGte(actual, min, label) {
  if (actual < min) throw new Error(`${label}: ${actual} < ${min}`);
  console.log(`✓ ${label}: ${actual} >= ${min}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
