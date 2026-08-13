import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  applicationStageEvents,
  applications,
  candidateProfiles,
  candidateSkills,
  companies,
  companyMembers,
  digestRuns,
  digestSent,
  education,
  emailSendLog,
  jobSkills,
  jobs,
  locations,
  messages,
  notificationPreferences,
  notificationQueue,
  notifications,
  profileDrafts,
  profileViews,
  reports,
  resumeSuggestions,
  savedSearches,
  skillAliases,
  skills,
  unsubscribeTokens,
  users,
  workExperiences,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  const dbUrl = process.env.DATABASE_URL || ENV.databaseUrl;
  if (!_db && dbUrl) {
    try {
      _db = drizzle(dbUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    userType: user.userType ?? "candidate",
    lastSignedIn: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: new Date(),
      userType: user.userType ?? sql`users.userType`,
    },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---------------------------------------------------------------------------
// Skill taxonomy — query-time alias resolution
// ---------------------------------------------------------------------------

/**
 * Resolves a search term to a canonical skill at QUERY time via the alias table.
 * Resolution order: exact alias match (case-insensitive) → exact canonical name
 * → slug → substring alias → substring canonical name.
 */
export async function resolveSkillByTerm(term: string) {
  const db = await getDb();
  if (!db) return null;
  const t = term.trim().toLowerCase();
  if (!t) return null;

  // 1. exact alias match (aliases stored lowercase)
  let rows = await db.select().from(skillAliases).where(eq(skillAliases.alias, t)).limit(1);
  if (rows.length > 0) {
    const skillRows = await db.select().from(skills).where(eq(skills.id, rows[0].skillId)).limit(1);
    if (skillRows.length > 0) return skillRows[0];
  }

  // 2. exact canonical name (lowercase compare via LOWER)
  let nameRows = await db.select().from(skills).where(eq(sql`LOWER(${skills.name})`, t)).limit(1);
  if (nameRows.length > 0) return nameRows[0];

  // 3. slug match
  let slugRows = await db.select().from(skills).where(eq(skills.slug, t)).limit(1);
  if (slugRows.length > 0) return slugRows[0];

  // 4. alias contains term OR term contains alias (fuzzy)
  let fuzzyRows = await db.select().from(skillAliases).where(
    or(like(skillAliases.alias, `%${t}%`), like(sql`LOWER(CONCAT('%', ${skillAliases.alias}, '%'))`, `%${t}%`)),
  ).limit(1);
  if (fuzzyRows.length > 0) {
    const skillRows = await db.select().from(skills).where(eq(skills.id, fuzzyRows[0].skillId)).limit(1);
    if (skillRows.length > 0) return skillRows[0];
  }

  // 5. canonical name contains term
  let containsRows = await db.select().from(skills).where(like(sql`LOWER(${skills.name})`, `%${t}%`)).limit(1);
  if (containsRows.length > 0) return containsRows[0];

  return null;
}

/**
 * Alias-aware multi-term search: splits a query into tokens and returns the
 * UNION of skill ids each token resolves to — used to expand job/candidate
 * search at query time, never at write time.
 */
export async function resolveSkillIdsByQuery(query: string) {
  if (!query || !query.trim()) return [];
  const tokens = query.split(/[\s,;]+/).filter(Boolean);
  const ids = new Set<number>();
  for (const token of tokens) {
    const skill = await resolveSkillByTerm(token);
    if (skill) ids.add(skill.id);
  }
  return Array.from(ids);
}

export async function listSkillCategories() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ category: skills.category }).from(skills).groupBy(skills.category);
  return rows.map((r) => r.category);
}

export async function listSkillsByCategory(category: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skills).where(eq(skills.category, category)).limit(limit);
}

export async function searchSkills(term: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const t = term.trim().toLowerCase();
  if (!t) return [];
  const byAlias = await db.select().from(skillAliases).where(like(skillAliases.alias, `${t}%`)).limit(limit);
  const out: any[] = [];
  const seen = new Set<number>();
  for (const a of byAlias) {
    if (seen.has(a.skillId)) continue;
    seen.add(a.skillId);
    const skillRows = await db.select().from(skills).where(eq(skills.id, a.skillId)).limit(1);
    if (skillRows.length) out.push(skillRows[0]);
  }
  const byName = await db.select().from(skills).where(like(sql`LOWER(${skills.name})`, `${t}%`)).limit(limit);
  for (const s of byName) {
    if (!seen.has(s.id)) out.push(s);
    seen.add(s.id);
  }
  return out.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Candidate profile helpers
// ---------------------------------------------------------------------------
export async function getCandidateProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function getCandidateProfileById(profileId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(candidateProfiles).where(eq(candidateProfiles.id, profileId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertCandidateProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await getCandidateProfileByUserId(userId);
  if (existing) {
    await db.update(candidateProfiles).set(data).where(eq(candidateProfiles.id, existing.id));
    return existing;
  }
  const result = await db.insert(candidateProfiles).values({ userId, ...data });
  const rows = await getCandidateProfileByUserId(userId);
  return rows;
}

export async function listCandidateSkills(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: candidateSkills.id,
      proficiency: candidateSkills.proficiency,
      years: candidateSkills.years,
      skillId: candidateSkills.skillId,
      name: skills.name,
      category: skills.category,
    })
    .from(candidateSkills)
    .innerJoin(skills, eq(skills.id, candidateSkills.skillId))
    .where(eq(candidateSkills.profileId, profileId));
  return rows;
}

export async function listWorkExperiences(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workExperiences).where(eq(workExperiences.profileId, profileId)).orderBy(desc(workExperiences.startDate));
}

export async function listEducation(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(education).where(eq(education.profileId, profileId));
}

// ---------------------------------------------------------------------------
// Profile draft — server-side per-step persistence
// ---------------------------------------------------------------------------
export async function getProfileDraft(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(profileDrafts).where(eq(profileDrafts.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function saveProfileDraft(userId: number, currentStep: number, stepData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await getProfileDraft(userId);
  if (existing) {
    await db.update(profileDrafts).set({ currentStep, stepData }).where(eq(profileDrafts.userId, userId));
  } else {
    await db.insert(profileDrafts).values({ userId, currentStep, stepData });
  }
  return { userId, currentStep, stepData };
}

export async function clearProfileDraft(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(profileDrafts).where(eq(profileDrafts.userId, userId));
}

// ---------------------------------------------------------------------------
// Resume suggestions — nothing written until explicitly confirmed
// ---------------------------------------------------------------------------
export async function createResumeSuggestions(profileId: number, suggestions: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.insert(resumeSuggestions).values(
    suggestions.map((s) => ({ profileId, kind: s.kind, data: s.data })),
  );
  return rows;
}

export async function listResumeSuggestions(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resumeSuggestions).where(eq(resumeSuggestions.profileId, profileId));
}

export async function updateResumeSuggestionStatus(id: number, status: "confirmed" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(resumeSuggestions).set({ status }).where(eq(resumeSuggestions.id, id));
  const rows = await db.select().from(resumeSuggestions).where(eq(resumeSuggestions.id, id)).limit(1);
  return rows[0];
}

/**
 * Applies a CONFIRMED suggestion to the candidate profile. Only suggestions
 * with status='confirmed' may be applied; the suggestion itself is never
 * applied silently — the candidate must confirm first.
 */
export async function applyConfirmedSuggestion(suggestion: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (suggestion.kind === "workExperience") {
    const d = suggestion.data as any;
    await db.insert(workExperiences).values({
      profileId: suggestion.profileId,
      title: d.title ?? "Unknown role",
      company: d.company ?? "Unknown company",
      startDate: d.startDate ?? null,
      endDate: d.endDate ?? null,
      current: d.current ?? false,
      description: d.description ?? null,
    });
  } else if (suggestion.kind === "education") {
    const d = suggestion.data as any;
    await db.insert(education).values({
      profileId: suggestion.profileId,
      institution: d.institution ?? "Unknown institution",
      degree: d.degree ?? "Unknown degree",
      fieldOfStudy: d.fieldOfStudy ?? null,
      startYear: d.startYear ?? null,
      endYear: d.endYear ?? null,
    });
  } else if (suggestion.kind === "skill") {
    const d = suggestion.data as any;
    const skill = await resolveSkillByTerm(d.name);
    if (skill) {
      const existing = await db
        .select()
        .from(candidateSkills)
        .where(and(eq(candidateSkills.profileId, suggestion.profileId), eq(candidateSkills.skillId, skill.id)))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(candidateSkills).values({
          profileId: suggestion.profileId,
          skillId: skill.id,
          proficiency: d.proficiency ?? "intermediate",
          years: d.years ?? 0,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Jobs — published browse + alias-aware search
// ---------------------------------------------------------------------------
export async function getPublishedJobs({ page = 1, pageSize = 20, query, locationId, remotePolicy, seniority, minSalary, maxSalary }: any = {}) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const conditions = [eq(jobs.published, true)];
  if (locationId) conditions.push(eq(jobs.locationId, locationId));
  if (remotePolicy) conditions.push(eq(jobs.remotePolicy, remotePolicy));
  if (seniority) conditions.push(eq(jobs.seniority, seniority));
  if (minSalary) conditions.push(sql`${jobs.salaryMax} >= ${minSalary}`);
  if (maxSalary) conditions.push(sql`${jobs.salaryMin} <= ${maxSalary}`);

  let skillIds: number[] = [];
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    skillIds = await resolveSkillIdsByQuery(q);
    if (skillIds.length === 0) {
      // fall back to title-text match
      const textRows = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(...conditions, like(sql`LOWER(${jobs.title})`, `%${q}%`)))
        .limit(1000);
      const ids = textRows.map((r) => r.id);
      return {
        rows: ids.length
          ? await fetchJobsWithDetails(ids)
          : [],
        total: ids.length,
        skillQuery: [],
      };
    }
  }

  const baseWhere = and(...conditions);

  let matchedJobIds: number[];
  if (skillIds.length > 0) {
    // Jobs whose required/preferred skills intersect the resolved skill ids
    const jsRows = await db
      .selectDistinct({ jobId: jobSkills.jobId })
      .from(jobSkills)
      .where(inArray(jobSkills.skillId, skillIds));
    matchedJobIds = jsRows.map((r) => r.jobId);
    if (matchedJobIds.length === 0) return { rows: [], total: 0, skillQuery: skillIds };
  } else {
    const allRows = await db.select({ id: jobs.id }).from(jobs).where(baseWhere).limit(5000);
    matchedJobIds = allRows.map((r) => r.id);
  }

  // Title text filter for tokens that did NOT resolve to skills.
  // Semantics: each query token is either a skill alias (match jobs tagged with
  // that skill) or a plain keyword (must appear in the job title). Queries like
  // "js" or "js frontend" therefore work as candidates expect.
  const queryText = query?.trim().toLowerCase();
  if (queryText) {
    const tokens = queryText.split(/[\s,;]+/).filter(Boolean);
    const textTokens: string[] = [];
    for (const tk of tokens) {
      const resolved = await resolveSkillByTerm(tk);
      if (!resolved) textTokens.push(tk);
    }
    if (textTokens.length > 0) {
      const titleOr = textTokens.map((tk: string) => like(sql`LOWER(${jobs.title})`, `%${tk}%`));
      const titleRows = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(...conditions, or(...titleOr)));
      const titleIds = new Set(titleRows.map((r) => r.id));
      matchedJobIds = matchedJobIds.filter((id) => titleIds.has(id));
      if (matchedJobIds.length === 0) return { rows: [], total: 0, skillQuery: skillIds };
    }
  }

  const total = matchedJobIds.length;
  const pageIds = matchedJobIds.slice(offset, offset + pageSize);
  const rows = await fetchJobsWithDetails(pageIds);
  // sort by createdAt desc
  rows.sort((a: any, b: any) => Number(b.createdAt) - Number(a.createdAt));
  return { rows, total, skillQuery: skillIds };
}

async function fetchJobsWithDetails(ids: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (ids.length === 0) return [];
  const jobRows = await db.select().from(jobs).where(inArray(jobs.id, ids));
  const skillsByJob = new Map<number, any[]>();
  const jsRows = await db.select().from(jobSkills).where(inArray(jobSkills.jobId, ids));
  for (const js of jsRows) {
    if (!skillsByJob.has(js.jobId)) skillsByJob.set(js.jobId, []);
    skillsByJob.get(js.jobId)!.push(js);
  }
  const skillIds = Array.from(new Set(jsRows.map((j) => j.skillId)));
  const skillRows = await db.select().from(skills).where(inArray(skills.id, skillIds));
  const skillMap = new Map(skillRows.map((s) => [s.id, s]));

  const locIds = Array.from(new Set(jobRows.map((j) => j.locationId).filter(Boolean) as number[]));
  const locRows = await db.select().from(locations).where(inArray(locations.id, locIds));
  const locMap = new Map(locRows.map((l) => [l.id, l]));

  const compIds = Array.from(new Set(jobRows.map((j) => j.companyId)));
  const compRows = await db.select().from(companies).where(inArray(companies.id, compIds));
  const compMap = new Map(compRows.map((c) => [c.id, c]));

  return jobRows.map((job) => ({
    ...job,
    skills: (skillsByJob.get(job.id) ?? []).map((js) => ({
      ...skillMap.get(js.skillId),
      weight: js.weight,
    })),
    location: locMap.get(job.locationId as number) ?? null,
    company: compMap.get(job.companyId as number) ?? null,
  }));
}

export async function getJobSkills(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobSkills).where(eq(jobSkills.jobId, jobId));
}

export async function getJobById(jobId: number) {
  const db = await getDb();
  if (!db) return null;
  const jobRows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (jobRows.length === 0) return null;
  const job = jobRows[0];
  const jsRows = await db.select().from(jobSkills).where(eq(jobSkills.jobId, jobId));
  const skillIds = jsRows.map((j) => j.skillId);
  const skillRows = skillIds.length
    ? await db.select().from(skills).where(inArray(skills.id, skillIds))
    : [];
  const skillMap = new Map(skillRows.map((s) => [s.id, s]));
  const locRows = job.locationId
    ? await db.select().from(locations).where(eq(locations.id, job.locationId)).limit(1)
    : [];
  const compRows = await db.select().from(companies).where(eq(companies.id, job.companyId)).limit(1);
  return {
    ...job,
    skills: jsRows.map((js) => ({ ...(skillMap.get(js.skillId) ?? { id: js.skillId, name: "?", slug: "", category: "" }), weight: js.weight })),
    location: locRows[0] ?? null,
    company: compRows[0] ?? null,
  };
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------
export async function createCompany(data: any, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(companies).values(data);
  const rows = await db.select().from(companies).where(eq(companies.name, data.name)).limit(1);
  const company = rows[0];
  await db.insert(companyMembers).values({ userId, companyId: company.id, role: "owner" });
  return company;
}

export async function getCompanyById(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  return rows[0] ?? null;
}

export async function getMyCompanyMembership(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ id: companyMembers.id, companyId: companyMembers.companyId, role: companyMembers.role })
    .from(companyMembers)
    .where(eq(companyMembers.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Queue worker invoked by the scheduled /api/scheduled/processQueue callback.
 * Claims pending rows, dispatches each (Resend when RESEND_API_KEY is set,
 * no-op logged transport otherwise), applies backoff on failure, dead-letters
 * after MAX_RETRIES. Safe to call repeatedly — job_key uniqueness prevents duplicates.
 */
export async function runQueueWorker(batchSize = 20) {
  const db = await getDb();
  if (!db) return { processed: 0, results: [] };
  const batch = await claimQueueBatch(batchSize);
  const results: { queueId: number; status: "sent" | "failed" | "dead"; retryCount: number }[] = [];
  for (const row of batch) {
    const payload = (typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload) as Record<string, unknown>;
    let recipientEmail: string | null = null;
    const users = await getUsersByIds([row.recipientUserId]);
    recipientEmail = users[0]?.email ?? null;
    let outcome: "sent" | "skipped_no_email" | "transport_error" | "logged_only" = "logged_only";
    let providerResponse: string | null = null;
    try {
      if (!recipientEmail) {
        outcome = "skipped_no_email";
      } else if (process.env.RESEND_API_KEY) {
        const res: Response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "HireWise <onboarding@resend.dev>",
            to: [recipientEmail],
            subject: row.subject ?? "HireWise notification",
            html: emailTemplate(String(row.subject ?? "HireWise notification"), payload),
          }),
        });
        if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
        outcome = "sent";
        providerResponse = `HTTP ${res.status}`;
      } else {
        outcome = "logged_only";
        providerResponse = `no-op transport; subject=${row.subject ?? ""}`;
      }
    } catch (e: any) {
      outcome = "transport_error";
      providerResponse = String(e?.message ?? e).slice(0, 500);
      const res = await markQueueFailed(row.id, String(e?.message ?? e).slice(0, 2000), Number(row.retryCount ?? 0));
      results.push({ queueId: row.id, status: res?.dead ? "dead" : "failed", retryCount: (res as any)?.retryCount ?? Number(row.retryCount ?? 0) + 1 });
      continue;
    }
    await markQueueSent(row.id, {
      queueId: row.id,
      recipientUserId: row.recipientUserId,
      recipientEmail,
      subject: row.subject,
      outcome,
      providerResponse,
    });
    results.push({ queueId: row.id, status: "sent", retryCount: 0 });
  }
  return { processed: batch.length, results };
}

/** Plain-text-safe email body for queue dispatch. */
function emailTemplate(subject: string, payload: Record<string, unknown>): string {
  const rows = Object.entries(payload)
    .slice(0, 8)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #e5e7eb">${k}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${String(v)}</td></tr>`)
    .join("");
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#1a2744">${subject}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
<p style="margin-top:24px;color:#6b7280;font-size:12px">HireWise · You can manage these notifications from your notification settings.</p>
</body></html>`;
}

/** Resolve user rows by ids (for queue dispatch recipient lookup). */
export async function getUsersByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  const unique = Array.from(new Set(ids)).filter((n) => Number.isInteger(n) && n > 0);
  if (unique.length === 0) return [];
  return db.select({ id: users.id, email: users.email }).from(users).where(inArray(users.id, unique));
}

/** Owner (first member) of a company — used to route notifications to the employer. */
export async function getCompanyOwner(companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ userId: companyMembers.userId })
    .from(companyMembers)
    .where(eq(companyMembers.companyId, companyId))
    .orderBy(asc(companyMembers.id))
    .limit(1);
  return rows[0]?.userId ?? null;
}

export async function getUserCompanies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const memberships = await db
    .select({ companyId: companyMembers.companyId, role: companyMembers.role })
    .from(companyMembers)
    .where(eq(companyMembers.userId, userId));
  if (memberships.length === 0) return [];
  const rows = await db.select().from(companies).where(inArray(companies.id, memberships.map((m) => m.companyId)));
  return rows.map((c) => ({ ...c, membership: memberships.find((m) => m.companyId === c.id) }));
}

// ---------------------------------------------------------------------------
// Employer job management
// ---------------------------------------------------------------------------
export async function createJob(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(jobs).values(data);
  const jobId = (result as any)[0].insertId;
  if (data.skills?.length) {
    await db.insert(jobSkills).values(
      data.skills.map((s: any) => ({ jobId, skillId: s.skillId, weight: s.weight })),
    );
  }
  return jobId;
}

export async function getLocationById(locationId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(locations).where(eq(locations.id, locationId)).limit(1);
  return rows[0] ?? null;
}

export async function getCompanyPublishedJobs(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const jobRows = await db.select().from(jobs).where(and(eq(jobs.companyId, companyId), eq(jobs.published, true))).orderBy(desc(jobs.createdAt));
  const jobIds = jobRows.map((j) => j.id);
  if (jobIds.length === 0) return jobRows;
  const jsRows = await db.select().from(jobSkills).where(inArray(jobSkills.jobId, jobIds));
  const skillIds = Array.from(new Set(jsRows.map((j) => j.skillId)));
  const skillRows = skillIds.length ? await db.select().from(skills).where(inArray(skills.id, skillIds)) : [];
  const skillMap = new Map(skillRows.map((s) => [s.id, s]));
  const skillsByJob = new Map<number, any[]>();
  for (const js of jsRows) {
    if (!skillsByJob.has(js.jobId)) skillsByJob.set(js.jobId, []);
    skillsByJob.get(js.jobId)!.push({ ...(skillMap.get(js.skillId) ?? { id: js.skillId, name: "?", slug: "", category: "" }), weight: js.weight });
  }
  const locIds = Array.from(new Set(jobRows.map((j) => j.locationId).filter(Boolean) as number[]));
  const locRows = locIds.length ? await db.select().from(locations).where(inArray(locations.id, locIds)) : [];
  const locMap = new Map(locRows.map((l) => [l.id, l]));
  return jobRows.map((j) => ({
    ...j,
    skills: skillsByJob.get(j.id) ?? [],
    location: j.locationId ? (locMap.get(j.locationId) ?? null) : null,
    company: null as any,
  }));
}

export async function getCompanyJobs(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const jobRows = await db.select().from(jobs).where(eq(jobs.companyId, companyId)).orderBy(desc(jobs.createdAt));
  const jobIds = jobRows.map((j) => j.id);
  if (jobIds.length === 0) return jobRows;
  const jsRows = await db.select().from(jobSkills).where(inArray(jobSkills.jobId, jobIds));
  const skillIds = Array.from(new Set(jsRows.map((j) => j.skillId)));
  const skillRows = skillIds.length ? await db.select().from(skills).where(inArray(skills.id, skillIds)) : [];
  const skillMap = new Map(skillRows.map((s) => [s.id, s]));
  const skillsByJob = new Map<number, any[]>();
  for (const js of jsRows) {
    if (!skillsByJob.has(js.jobId)) skillsByJob.set(js.jobId, []);
    skillsByJob.get(js.jobId)!.push({ ...(skillMap.get(js.skillId) ?? { id: js.skillId, name: "?", slug: "", category: "" }), weight: js.weight });
  }
  return jobRows.map((j) => ({ ...j, skills: skillsByJob.get(j.id) ?? [] }));
}

export async function updateJobPublishState(jobId: number, published: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(jobs).set({ published }).where(eq(jobs.id, jobId));
  return { jobId, published };
}

export async function deleteJob(jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(jobSkills).where(eq(jobSkills.jobId, jobId));
  await db.delete(applications).where(eq(applications.jobId, jobId));
  await db.delete(jobs).where(eq(jobs.id, jobId));
}

export async function updateJob(jobId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const { skills, ...rest } = data;
  await db.update(jobs).set(rest).where(eq(jobs.id, jobId));
  if (skills) {
    await db.delete(jobSkills).where(eq(jobSkills.jobId, jobId));
    if (skills.length) {
      await db.insert(jobSkills).values(skills.map((s: any) => ({ jobId, skillId: s.skillId, weight: s.weight })));
    }
  }
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------
export async function applyToJob(jobId: number, profileId: number, coverNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db
    .select()
    .from(applications)
    .where(and(eq(applications.jobId, jobId), eq(applications.profileId, profileId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(applications).values({ jobId, profileId, coverNote: coverNote ?? null });
  const rows = await db
    .select()
    .from(applications)
    .where(and(eq(applications.jobId, jobId), eq(applications.profileId, profileId)))
    .limit(1);
  // bump denormalized counter
  await db.execute(sql`UPDATE ${jobs} SET applicationCount = (SELECT COUNT(*) FROM ${applications} WHERE ${applications.jobId} = ${jobs.id}) WHERE ${jobs.id} = ${jobId}`);
  return rows[0];
}

export async function getJobApplications(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  const appRows = await db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.createdAt));
  const profileIds = appRows.map((a) => a.profileId);
  if (profileIds.length === 0) return [];
  const profiles = await db.select().from(candidateProfiles).where(inArray(candidateProfiles.id, profileIds));
  const profMap = new Map(profiles.map((p) => [p.id, p]));
  const skillRows = await db
    .select({ profileId: candidateSkills.profileId, name: skills.name, proficiency: candidateSkills.proficiency })
    .from(candidateSkills)
    .innerJoin(skills, eq(skills.id, candidateSkills.skillId))
    .where(inArray(candidateSkills.profileId, profileIds));
  const skillsByProfile = new Map<number, any[]>();
  for (const s of skillRows) {
    if (!skillsByProfile.has(s.profileId)) skillsByProfile.set(s.profileId, []);
    skillsByProfile.get(s.profileId)!.push({ name: s.name, proficiency: s.proficiency });
  }
  const locIds = Array.from(new Set(profiles.map((p) => p.locationId).filter(Boolean) as number[]));
  const locRows = locIds.length ? await db.select().from(locations).where(inArray(locations.id, locIds)) : [];
  const locMap = new Map(locRows.map((l) => [l.id, l]));
  return appRows.map((a) => ({
    ...a,
    profile: profMap.get(a.profileId) ?? null,
    topSkills: skillsByProfile.get(a.profileId)?.slice(0, 6) ?? [],
    location: locMap.get(profMap.get(a.profileId)?.locationId as number) ?? null,
  }));
}

export async function getMyApplications(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const appRows = await db.select().from(applications).where(eq(applications.profileId, profileId)).orderBy(desc(applications.createdAt));
  const jobIds = appRows.map((a) => a.jobId);
  if (jobIds.length === 0) return [];
  const jobRows = await db.select().from(jobs).where(inArray(jobs.id, jobIds));
  const jobMap = new Map(jobRows.map((j) => [j.id, j]));
  const compIds = Array.from(new Set(jobRows.map((j) => j.companyId)));
  const compRows = compIds.length ? await db.select().from(companies).where(inArray(companies.id, compIds)) : [];
  const compMap = new Map(compRows.map((c) => [c.id, c]));
  return appRows.map((a) => ({
    ...a,
    job: jobMap.get(a.jobId) ?? null,
    company: compMap.get((jobMap.get(a.jobId)?.companyId ?? 0) as number) ?? null,
  }));
}

export async function updateApplicationStatus(applicationId: number, status: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(applications).set({ status }).where(eq(applications.id, applicationId));
  return { applicationId, status };
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------
export async function listLocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(locations);
}

// ---------------------------------------------------------------------------
// Stats for dashboard
// ---------------------------------------------------------------------------
export async function getApplicationStatsForJobs(jobIds: number[]) {
  const db = await getDb();
  if (!db || jobIds.length === 0) return [];
  const rows = await db
    .select({ jobId: applications.jobId, status: applications.status, count: sql<number>`COUNT(*)` })
    .from(applications)
    .where(inArray(applications.jobId, jobIds))
    .groupBy(applications.jobId, applications.status);
  return rows;
}

// ---------------------------------------------------------------------------
// Phase 2 — Ranked search (single-SQL weighted relevance)
//
// Design note (ADR #1): the spec is written for PostgreSQL (tsvector /
// pg_trgm / earthdistance). This database is TiDB (MySQL-compatible) and does
// not support FULLTEXT indexes. All four signal families are therefore
// composed in ONE SQL statement with LIKE + trigram-style bigram similarity
// for the typo tier, haversine in SQL, exponential recency decay, and
// salary-band compatibility. Weights live in shared/ranking.ts.
// ---------------------------------------------------------------------------
import { RANKING_WEIGHTS, MAX_SCORE } from "../shared/ranking";

export type RankSearchOptions = {
  query?: string;
  locationId?: number;
  /** Candidate location lat/lon for distance signal */
  candidateLat?: number;
  candidateLng?: number;
  remotePolicy?: string;
  seniority?: string;
  minSalary?: number;
  maxSalary?: number;
  skillIds?: number[];
  /** Keyset cursor: [score, jobId] of the last item on the previous page */
  cursor?: [number, number] | null;
  pageSize?: number;
};

export type RankResult = {
  id: number;
  title: string;
  score: number;
  text: number;
  skills: number;
  distance: number;
  recency: number;
  salary: number;
  salaryMin: number | null;
  salaryMax: number | null;
  locationName: string | null;
  companyName: string | null;
  remotePolicy: string | null;
  seniority: string | null;
  postedDaysAgo: number | null;
};

export type FacetCounts = {
  remote: Record<string, number>;
  seniority: Record<string, number>;
  salaryBucket: Record<string, number>;
};

// Safe IN-list for numeric ids: drizzle-orm's sql.join collapses array params into
// a single nested param, so we inline validated integers as raw SQL literals.
function numericInList(ids: number[]): string {
  return ids.filter((n) => Number.isFinite(n)).map((n) => String(Math.trunc(n))).join(", ");
}
export async function rankedSearchJobs(opts: RankSearchOptions): Promise<{ rows: RankResult[]; nextCursor: [number, number] | null; totalExact: number; totalWithTypo: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const pageSize = Math.min(opts.pageSize ?? 20, 50);
  const cursor = opts.cursor ?? null;

  // Resolve skills at query time (alias expansion)
  const skillIds = opts.skillIds ?? (opts.query ? await resolveSkillIdsByQuery(opts.query) : []);

  const q = opts.query?.trim().toLowerCase() ?? "";
  const tokens = q ? q.split(/[\s,;]+/).filter(Boolean) : [];
  const resolvedTokens = new Set<string>();
  for (const tk of tokens) {
    const r = await resolveSkillByTerm(tk);
    if (r) resolvedTokens.add(r.name.toLowerCase());
  }
  const plainTokens = tokens.filter((tk) => !resolvedTokens.has(tk.toLowerCase()));

  // Build the text-relevance expression: title LIKE tiers + bigram fallback.
  // NOTE: a blank initial accumulator renders `CASE WHEN  THEN` (empty condition,
  // invalid SQL) — always reduce from a never-match base when there are tokens,
  // and fall back to a 0=1 sentinel when there are no text tokens at all.
  const textTokenNone = sql`0=1`;
  const titleExact: ReturnType<typeof sql> = plainTokens.length
    ? plainTokens.map((t) => sql`LOWER(j.title) LIKE CONCAT('%', ${t}, '%')`).reduce((acc, e) => sql`${acc} OR ${e}`, textTokenNone)
    : textTokenNone;
  const bodyExact: ReturnType<typeof sql> = plainTokens.length
    ? plainTokens.map((t) => sql`LOWER(j.description) LIKE CONCAT('%', ${t}, '%')`).reduce((acc, e) => sql`${acc} OR ${e}`, textTokenNone)
    : textTokenNone;
  // Fuzzy similarity via sliding fragment overlap: fraction of 3-char fragments of
  // the query token found inside title/description (a typo like "javascrpt" still
  // shares most fragments with "javascript").
  function fragmentSim(col: ReturnType<typeof sql>, token: string): ReturnType<typeof sql> {
    const t = token.toLowerCase();
    if (t.length <= 2) return sql`CASE WHEN ${col} LIKE CONCAT('%', ${t}, '%') THEN 1 ELSE 0 END`;
    const frags: ReturnType<typeof sql>[] = [];
    for (let i = 0; i + 3 <= t.length; i++) frags.push(sql`CASE WHEN ${col} LIKE CONCAT('%', ${t.slice(i, i + 3)}, '%') THEN 1 ELSE 0 END`);
    const fragsSql = frags.reduce((acc, e, i) => (i === 0 ? e : sql`${acc} + ${e}`), sql``) as ReturnType<typeof sql>;
    return sql`CAST(${fragsSql} AS DECIMAL(5,2)) / ${frags.length}`;
  }
  // Fuzzy fragments over no text tokens must not render blank expressions — use 0.
  const titleFuzzy: ReturnType<typeof sql> = plainTokens.length
    ? plainTokens.map((t) => fragmentSim(sql`LOWER(j.title)`, t)).reduce((acc, e) => sql`${acc} + ${e}`, sql`0`)
    : sql`0`;
  const bodyFuzzy: ReturnType<typeof sql> = plainTokens.length
    ? plainTokens.map((t) => fragmentSim(sql`LOWER(j.description)`, t)).reduce((acc, e) => sql`${acc} + ${e}`, sql`0`)
    : sql`0`;

  // Skill overlap: fraction of required + preferred weight satisfied
  // Match a job skill if ANY of its aliases is in the resolved skill set (covers the canonical name too, since we seed name as its own alias).
  const requiredExpr = skillIds.length
    ? sql`IFNULL((SELECT SUM(CASE WHEN js2.skillId IN (${sql.raw(numericInList(skillIds))}) THEN 1 ELSE 0 END) FROM jobSkills js2) / NULLIF((SELECT COUNT(*) FROM jobSkills js3 WHERE js3.jobId = j.id AND js3.weight = 'required'), 0), 0)`
    : sql`0`;
  const preferredExpr = skillIds.length
    ? sql`(SELECT SUM(CASE WHEN js4.weight = 'preferred' THEN 1 ELSE 0 END) FROM jobSkills js4 WHERE js4.jobId = j.id AND js4.skillId IN (${sql.raw(numericInList(skillIds))}) AND js4.weight = 'preferred') / NULLIF((SELECT COUNT(*) FROM jobSkills js5 WHERE js5.jobId = j.id AND js5.weight = 'preferred'), 0)`
    : sql`0`;

  const w = RANKING_WEIGHTS;

  // Haversine distance in km using coordinates on locations
  const distExpr =
    opts.candidateLat != null && opts.candidateLng != null
      ? sql`(6371 * ACOS(LEAST(1, GREATEST(-1, SIN(RADIANS(${opts.candidateLat})) * SIN(RADIANS(loc.latitude)) + COS(RADIANS(${opts.candidateLat})) * COS(RADIANS(loc.latitude)) * COS(RADIANS(loc.longitude) - RADIANS(${opts.candidateLng}))))))`
      : sql`NULL`;

  // Salary compatibility: 1 when ranges overlap, partial when adjacent
  const salaryExpr =
    opts.minSalary || opts.maxSalary
      ? sql`IF(LEAST(${opts.maxSalary ?? 1e9}, j.salaryMax) >= GREATEST(${opts.minSalary ?? 0}, j.salaryMin), 1, 0)`
      : sql`1`;

  const conditions = sql`j.published = 1`;
  const conditionsSql = [
    opts.locationId != null ? sql`j.locationId = ${opts.locationId}` : null,
    opts.remotePolicy ? sql`j.remotePolicy = ${opts.remotePolicy}` : null,
    opts.seniority ? sql`j.seniority = ${opts.seniority}` : null,
    opts.minSalary ? sql`j.salaryMax >= ${opts.minSalary}` : null,
    opts.maxSalary ? sql`j.salaryMin <= ${opts.maxSalary}` : null,
    skillIds.length
      ? sql`j.id IN (SELECT DISTINCT js.jobId FROM jobSkills js WHERE js.skillId IN (${sql.raw(numericInList(skillIds))}))`
      : null,
  ].filter(Boolean) as ReturnType<typeof sql>[];

  const whereExtra = conditionsSql.length ? sql` AND ${sql.join(conditionsSql, sql` AND `)}` : sql``;
  // NOTE: TiDB's prepared-statement parser rejects `? * (CASE ... END)` (literal-wrapped
  // CASE inside a parameterized multiply). Weights are pushed inside the CASE branches
  // instead so every expression is a plain CASE/IFNULL/POW term.
  const scoreFrag = sql`
    (CASE WHEN ${titleExact} THEN ${w.text.title} ELSE 0 END +
     CASE WHEN ${bodyExact} THEN ${w.text.body} ELSE 0 END +
     ${w.skills.required} * ${requiredExpr} +
     ${w.skills.preferred} * ${preferredExpr} +
     CASE WHEN j.remotePolicy IN ('remote','flexible') OR loc.city = 'Remote' THEN ${w.distance} ELSE COALESCE(CASE WHEN ${distExpr} IS NULL THEN ${sql`CAST(${w.distance} AS DECIMAL(6,4)) * 0.5`} ELSE GREATEST(0, ${sql`${w.distance} * (1 - ${distExpr} / ${w.maxDistanceKm})`}) END, ${sql`CAST(${w.distance} AS DECIMAL(6,4)) * 0.5`}) END +
     ${w.recency} * POW(2, -IFNULL(DATEDIFF(NOW(), j.createdAt), 0) / ${w.recencyHalfLifeDays}) +
     ${w.salary} * ${salaryExpr}) AS raw
  `;

  const fuzzyScore = sql`(
    CASE WHEN ${titleExact} THEN 1 WHEN ${bodyExact} THEN 0.9
    ELSE GREATEST(${titleFuzzy}, ${bodyFuzzy}) * 0.85 END
  )`;

  // Two-pass: exact tier and typo tier each as its own query, then merge.
  // No query AND no skills means "browse everything published".
  const hasAnyFilter = skillIds.length > 0 || tokens.length > 0;
  async function runTier(isTypo: boolean) {
    const matchCond = !hasAnyFilter
      ? sql`1=1`
      : isTypo
        ? sql`${fuzzyScore} > 0.4`
        : sql`(${titleExact} OR ${bodyExact} OR (${skillIds.length ? sql`1=1` : sql`0=1`}))`;
    const select = sql`
      SELECT j.id, j.title, ${scoreFrag},
        (CASE WHEN ${titleExact} THEN ${w.text.title} ELSE 0 END + CASE WHEN ${bodyExact} THEN ${w.text.body} ELSE 0 END) AS rawText,
        (${w.skills.required} * ${requiredExpr} + ${w.skills.preferred} * ${preferredExpr}) AS rawSkills,
        (CASE WHEN j.remotePolicy IN ('remote','flexible') OR loc.city = 'Remote' THEN ${w.distance} ELSE COALESCE(CASE WHEN ${distExpr} IS NULL THEN ${sql`${w.distance} * 0.5`} ELSE GREATEST(0, ${sql`${w.distance} * (1 - ${distExpr} / ${w.maxDistanceKm})`}) END, ${sql`${w.distance} * 0.5`}) END) AS rawDistance,
        (${w.recency} * POW(2, -IFNULL(DATEDIFF(NOW(), j.createdAt), 0) / ${w.recencyHalfLifeDays})) AS rawRecency,
        (${w.salary} * ${salaryExpr}) AS rawSalary,
        j.salaryMin, j.salaryMax, j.remotePolicy, j.seniority,
        DATEDIFF(NOW(), j.createdAt) AS postedDaysAgo,
        CONCAT_WS(', ', NULLIF(loc.city,''), NULLIF(loc.country,'')) AS locationName,
        c.name AS companyName
      FROM jobs j
      LEFT JOIN locations loc ON loc.id = j.locationId
      LEFT JOIN companies c ON c.id = j.companyId
      WHERE j.published = 1${whereExtra} AND ${matchCond}
    `;
    if (!db) return [];
    const [rows]: any = await db.execute(select);
    return (rows ?? []) as any[];
  }

  const exact = await runTier(false);
  const typo = exact.length < w.typoFallbackMinResults ? await runTier(true) : [];

  // Normalize scores to 0-100 per signal contribution
  function toResult(r: any): RankResult {
    return {
      id: r.id,
      title: r.title,
      score: Math.min(100, Math.round(r.raw * 100)),
      text: Math.round(r.rawText * 100),
      skills: Math.round(r.rawSkills * 100),
      distance: Math.round(r.rawDistance * 100),
      recency: Math.round(r.rawRecency * 100),
      salary: Math.round(r.rawSalary * 100),
      salaryMin: r.salaryMin,
      salaryMax: r.salaryMax,
      locationName: r.locationName || null,
      companyName: r.companyName || null,
      remotePolicy: r.remotePolicy,
      seniority: r.seniority,
      postedDaysAgo: r.postedDaysAgo,
    };
  }
  void toResult;

  // Re-score on server for explainability (SQL gives raw 0-1 composite)
  const scoreAll = (rows: any[]) =>
    rows.map((r) => {
      const text = Math.min(1, r.rawText ?? 0);
      const skills = Math.min(1, r.rawSkills ?? 0);
      const distance = Math.min(1, r.rawDistance ?? 0);
      const recency = Math.min(1, r.rawRecency ?? 0);
      const salary = Math.min(1, r.rawSalary ?? 0);
      return {
        id: r.id,
        title: r.title,
        raw: r.raw,
        text,
        skills,
        distance,
        recency,
        salary,
        salaryMin: r.salaryMin,
        salaryMax: r.salaryMax,
        locationName: r.locationName || null,
        companyName: r.companyName || null,
        remotePolicy: r.remotePolicy,
        seniority: r.seniority,
        postedDaysAgo: r.postedDaysAgo,
      };
    });

  const exactScored = scoreAll(exact);
  const typoScored = scoreAll(typo);
  const totalExact = exactScored.length;
  const totalWithTypo = exactScored.length + typoScored.length;

  const merged = [...exactScored, ...typoScored].sort((a, b) => b.raw - a.raw || b.id - a.id);

  let paged = merged;
  if (cursor) {
    const idx = merged.findIndex((r) => r.raw < cursor[0] || (r.raw === cursor[0] && r.id < cursor[1]));
    if (idx >= 0) paged = merged.slice(idx);
  }
  const rows = paged.slice(0, pageSize);
  const nextCursor: [number, number] | null =
    rows.length === pageSize && paged.length > pageSize
      ? [rows[rows.length - 1].raw as number, rows[rows.length - 1].id as number]
      : null;

  return {
    rows: rows.map((r) => ({
      id: r.id,
      title: r.title,
      score: Math.min(MAX_SCORE, Math.round(r.raw * MAX_SCORE)),
      text: Math.round(r.text * 100),
      skills: Math.round(r.skills * 100),
      distance: Math.round(r.distance * 100),
      recency: Math.round(r.recency * 100),
      salary: Math.round(r.salary * 100),
      salaryMin: r.salaryMin,
      salaryMax: r.salaryMax,
      locationName: r.locationName,
      companyName: r.companyName,
      remotePolicy: r.remotePolicy,
      seniority: r.seniority,
      postedDaysAgo: r.postedDaysAgo,
    })),
    nextCursor,
    totalExact,
    totalWithTypo,
  };
}

export async function facetCountsForJobs(opts: RankSearchOptions): Promise<FacetCounts> {
  const db = await getDb();
  if (!db) return { remote: {}, seniority: {}, salaryBucket: {} };
  const q = opts.query?.trim().toLowerCase() ?? "";
  const tokens = q ? q.split(/[\s,;]+/).filter(Boolean) : [];
  const titleOrs = tokens.map((t) => sql`LOWER(j.title) LIKE CONCAT('%', ${t}, '%') OR LOWER(j.description) LIKE CONCAT('%', ${t}, '%')`);
  const titleOr = titleOrs.reduce((acc, e, i) => (i === 0 ? e : sql`${acc} OR ${e}`), sql``) as ReturnType<typeof sql>;

  const base = sql`
    SELECT j.remotePolicy, j.seniority,
      CASE WHEN j.salaryMax < 50000 THEN 'under-50k'
           WHEN j.salaryMax < 100000 THEN '50k-100k'
           WHEN j.salaryMax < 150000 THEN '100k-150k'
           ELSE 'over-150k' END AS bucket
    FROM jobs j
    WHERE j.published = 1${opts.skillIds?.length ? sql` AND j.id IN (SELECT js.jobId FROM jobSkills js WHERE js.skillId IN (${sql.join(opts.skillIds, sql`, `)}))` : sql``}${q ? sql` AND (${titleOr})` : sql``}${opts.locationId ? sql` AND j.locationId = ${opts.locationId}` : sql``}${opts.minSalary ? sql` AND j.salaryMax >= ${opts.minSalary}` : sql``}${opts.maxSalary ? sql` AND j.salaryMin <= ${opts.maxSalary}` : sql``}${opts.remotePolicy ? sql` AND j.remotePolicy = ${opts.remotePolicy}` : sql``}${opts.seniority ? sql` AND j.seniority = ${opts.seniority}` : sql``}
  `;
  const [rows]: any = await db.execute(base);
  const remote: Record<string, number> = {};
  const seniority: Record<string, number> = {};
  const salaryBucket: Record<string, number> = {};
  for (const r of rows as any[]) {
    if (r.remotePolicy) remote[r.remotePolicy] = (remote[r.remotePolicy] ?? 0) + 1;
    if (r.seniority) seniority[r.seniority] = (seniority[r.seniority] ?? 0) + 1;
    if (r.bucket) salaryBucket[r.bucket] = (salaryBucket[r.bucket] ?? 0) + 1;
  }
  return { remote, seniority, salaryBucket };
}

// ---------------------------------------------------------------------------
// Phase 2 — ATS stage history (immutable events)
// ---------------------------------------------------------------------------
export const STAGE_TRANSITIONS: Record<string, string[]> = {
  applied: ["screening", "interview", "offered", "accepted", "rejected"],
  screening: ["applied", "interview", "offered", "accepted", "rejected"],
  interview: ["applied", "screening", "offered", "accepted", "rejected"],
  offered: ["applied", "screening", "interview", "accepted", "rejected"],
  rejected: ["applied", "screening", "interview", "offered"],
  withdrawn: ["applied"],
};

const ALL_STATUSES = ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"];

export async function moveApplication(
  applicationId: number,
  toStatus: string,
  actorUserId: number,
  note?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const apps = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
  if (apps.length === 0) throw new Error("Application not found");
  const app = apps[0];
  if (app.status === toStatus) return { applicationId, status: app.status };
  if (!ALL_STATUSES.includes(toStatus)) throw new Error(`Unknown status ${toStatus}`);
  const allowed = STAGE_TRANSITIONS[app.status] ?? [];
  if (!allowed.includes(toStatus)) throw new Error(`Transition ${app.status} → ${toStatus} not allowed`);
  await db
    .insert(applicationStageEvents)
    .values({ applicationId, fromStatus: app.status, toStatus: toStatus as any, note, actorUserId });
  await db.update(applications).set({ status: toStatus as any }).where(eq(applications.id, applicationId));
  return { applicationId, status: toStatus };
}

export async function getStageHistory(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applicationStageEvents).where(eq(applicationStageEvents.applicationId, applicationId)).orderBy(asc(applicationStageEvents.id));
}

export async function getApplicationById(applicationId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Phase 2 — Profile views (candidate-side insight)
// ---------------------------------------------------------------------------
export async function recordProfileView(employerUserId: number, profileId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(profileViews).values({ employerUserId, profileId }).onDuplicateKeyUpdate({
    set: { createdAt: new Date() },
  });
}

export async function getProfileViewCount(profileId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [rows]: [unknown, unknown] = await db.execute(`SELECT COUNT(DISTINCT employerUserId) AS c FROM profileViews WHERE profileId = ${Number(profileId)}`);
  return Number((rows as any[])[0]?.c ?? 0);
}

// ---------------------------------------------------------------------------
// Phase 2 — Messaging (per application)
// ---------------------------------------------------------------------------
export async function sendMessage(applicationId: number, senderUserId: number, text: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(messages).values({ applicationId, senderUserId, text });
  const [rows]: [unknown, unknown] = await db.execute(`SELECT id FROM messages ORDER BY id DESC LIMIT 1`);
  return { messageId: Number((rows as any[])[0]?.id ?? 0) };
}

export async function getThread(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.applicationId, applicationId)).orderBy(asc(messages.createdAt));
}

export async function markMessagesRead(applicationId: number, forUserId: number) {
  const db = await getDb();
  if (!db) return;
  // Mark unread messages sent by the OTHER party as read
  await db.execute(`UPDATE messages SET readAt = NOW() WHERE applicationId = ${Number(applicationId)} AND senderUserId != ${Number(forUserId)} AND readAt IS NULL`);
}

export async function getUnreadCounts(applicationIds: number[], forUserId: number) {
  const db = await getDb();
  if (!db || applicationIds.length === 0) return new Map<number, number>();
  const [rows]: [unknown, unknown] = await db.execute(
    `SELECT applicationId, COUNT(*) AS c FROM messages WHERE applicationId IN (${applicationIds.join(",")}) AND senderUserId != ${Number(forUserId)} AND readAt IS NULL GROUP BY applicationId`,
  );
  const m = new Map<number, number>();
  for (const r of rows as any[]) m.set(Number(r.applicationId), Number(r.c));
  return m;
}

// ---------------------------------------------------------------------------
// Phase 2 — Notifications + queue (enqueued at event time, processed async)
// ---------------------------------------------------------------------------
export async function getNotificationPrefs(userId: number, channel: "in_app" | "email", eventType: string) {
  const db = await getDb();
  if (!db) return true;
  const rows = await db
    .select({ enabled: notificationPreferences.enabled })
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.channel, channel),
        eq(notificationPreferences.eventType, eventType),
      ),
    )
    .limit(1);
  return rows[0]?.enabled ?? true;
}

export async function setNotificationPref(userId: number, channel: "in_app" | "email", eventType: string, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(notificationPreferences)
    .values({ userId, channel, eventType, enabled })
    .onDuplicateKeyUpdate({ set: { enabled, updatedAt: new Date() } });
}

export async function getOrCreateUnsubscribeToken(userId: number, channel: "in_app" | "email") {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(unsubscribeTokens)
    .where(and(eq(unsubscribeTokens.userId, userId), eq(unsubscribeTokens.channel, channel)))
    .limit(1);
  if (rows.length > 0) return rows[0].token;
  const token = require("crypto").randomBytes(24).toString("hex");
  await db.insert(unsubscribeTokens).values({ userId, channel, token });
  return token;
}

export async function unsubscribeByToken(token: string) {
  const db = await getDb();
  if (!db) return { ok: false };
  const rows = await db.select().from(unsubscribeTokens).where(eq(unsubscribeTokens.token, token)).limit(1);
  if (rows.length === 0) return { ok: false };
  const t = rows[0];
  if (t.usedAt) return { ok: false, alreadyUsed: true };
  await db.update(unsubscribeTokens).set({ usedAt: new Date() }).where(eq(unsubscribeTokens.token, token));
  await db
    .update(notificationPreferences)
    .set({ enabled: false })
    .where(and(eq(notificationPreferences.userId, t.userId), eq(notificationPreferences.channel, (t as any).channel as any)));
  return { ok: true, userId: t.userId, channel: t.channel };
}

export async function enqueueNotification(opts: { jobKey: string; channel: "in_app" | "email"; recipientUserId: number; eventType: string; subject?: string; payload: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) return;
  const enabled = await getNotificationPrefs(opts.recipientUserId, opts.channel, opts.eventType);
  if (!enabled) return;
  await db
    .insert(notificationQueue)
    .values({
      jobKey: opts.jobKey,
      channel: opts.channel,
      recipientUserId: opts.recipientUserId,
      eventType: opts.eventType,
      subject: opts.subject,
      payload: opts.payload,
    })
    .onDuplicateKeyUpdate({
      set: { status: "pending", updatedAt: new Date(), retryCount: 0, backoffUntil: null, lastError: null },
    });
  // Always create the in-app notification so the bell badge is live even if email lags
  if (opts.channel === "email") {
    await db
      .insert(notifications)
      .values({ userId: opts.recipientUserId, type: opts.eventType, payload: opts.payload });
  }
}

export async function listNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(`UPDATE notifications SET readAt = NOW() WHERE userId = ${Number(userId)} AND readAt IS NULL`);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [rows]: [unknown, unknown] = await db.execute(`SELECT COUNT(*) AS c FROM notifications WHERE userId = ${Number(userId)} AND readAt IS NULL`);
  return Number((rows as any[])[0]?.c ?? 0);
}

// ---------------------------------------------------------------------------
// Phase 2 — Queue worker primitives (processed by scheduled worker)
// ---------------------------------------------------------------------------
export async function claimQueueBatch(batchSize = 20) {
  const db = await getDb();
  if (!db) return [];
  const [rows]: [unknown, unknown] = await db.execute(
    `SELECT * FROM notificationQueue WHERE status = 'pending' AND (backoffUntil IS NULL OR backoffUntil <= NOW()) ORDER BY id ASC LIMIT ${Number(batchSize)}`,
  );
  if ((rows as any[]).length === 0) return [];
  const ids = (rows as any[]).map((r) => r.id).join(",");
  await db.execute(`UPDATE notificationQueue SET status = 'processing', updatedAt = NOW() WHERE id IN (${ids})`);
  const [refreshed]: [unknown, unknown] = await db.execute(`SELECT * FROM notificationQueue WHERE id IN (${ids}) ORDER BY id ASC`);
  return refreshed as any[];
}

export async function markQueueSent(queueId: number, emailLog: { queueId: number; recipientUserId: number | null; recipientEmail: string | null; subject: string | null; outcome: "sent" | "skipped_no_email" | "transport_error" | "logged_only"; providerResponse: string | null }) {
  const db = await getDb();
  if (!db) return;
  await db.update(notificationQueue).set({ status: "sent", retryCount: 0, backoffUntil: null }).where(eq(notificationQueue.id, queueId));
  await db.insert(emailSendLog).values({
    queueId: emailLog.queueId,
    recipientUserId: emailLog.recipientUserId,
    recipientEmail: emailLog.recipientEmail,
    subject: emailLog.subject,
    outcome: emailLog.outcome,
    providerResponse: emailLog.providerResponse,
  });
}

export async function markQueueFailed(queueId: number, error: string, retryCount: number) {
  const db = await getDb();
  if (!db) return;
  const MAX_RETRIES = 6;
  // DB-authoritative: re-read the row's current retryCount so the dead-letter
  // decision never depends on a possibly stale caller-supplied value.
  const [rows]: [unknown, unknown] = await db.execute(
    `SELECT id, retryCount FROM notificationQueue WHERE id = ${Number(queueId)} LIMIT 1`,
  );
  const current = (rows as any[])?.[0];
  const base = current ? Number(current.retryCount ?? 0) : retryCount;
  if (base >= MAX_RETRIES) {
    await db.update(notificationQueue).set({ status: "dead", lastError: error }).where(eq(notificationQueue.id, queueId));
    return { dead: true };
  }
  // Exponential backoff: 60 * 2^retry seconds, capped at 1 hour
  const backoffSeconds = Math.min(60 * Math.pow(2, base), 3600);
  // lastError is TEXT — pass the escaped string directly into the query
  const escErr = error.replace(/\\/g, "\\\\").replace(/'/g, "\\'").slice(0, 2000);
  await db.execute(
    `UPDATE notificationQueue SET status = 'pending', retryCount = retryCount + 1, backoffUntil = DATE_ADD(NOW(), INTERVAL ${Number(backoffSeconds)} SECOND), lastError = '${escErr}' WHERE id = ${Number(queueId)}`,
  );
  return { dead: false, retryCount: base + 1, backoffSeconds };
}

export async function getQueueStats() {
  const db = await getDb();
  if (!db) return { pending: 0, processing: 0, failed: 0, dead: 0, sent: 0, total: 0, failureRate: "0.00" };
  const [rows]: [unknown, unknown] = await db.execute(
    `SELECT status, COUNT(*) AS c FROM notificationQueue GROUP BY status`,
  );
  const stats: Record<string, number> = { pending: 0, processing: 0, failed: 0, dead: 0, sent: 0 };
  for (const r of rows as any[]) stats[r.status] = Number(r.c);
  const total = stats.pending + stats.processing + stats.failed + stats.dead + stats.sent;
  // Failure rate: rows that did not complete successfully (failed + dead) as share of all rows.
  const failureRate = total > 0 ? ((stats.failed + stats.dead) / total) * 100 : 0;
  return {
    ...stats,
    total,
    failureRate: failureRate.toFixed(2),
  } as { pending: number; processing: number; failed: number; dead: number; sent: number; total: number; failureRate: string };
}

// ---------------------------------------------------------------------------
// Structured logging helper (queue layer)
// ---------------------------------------------------------------------------
/**
 * Structured, line-oriented log helper for the notification/queue layer.
 * Emits one JSON line per event: ISO timestamp, level, source, event type,
 * and arbitrary typed payload. Consumable by log collectors (jq/grep) and
 * readable in the dev server log.
 */
export function logEvent(event: string, payload: Record<string, unknown>, level: "info" | "warn" | "error" = "info") {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, src: "hirewise.queue", event, ...payload });
  if (level === "error") console.error(`[queue] ${line}`);
  else if (level === "warn") console.warn(`[queue] ${line}`);
  else console.log(`[queue] ${line}`);
}

// ---------------------------------------------------------------------------
// Phase 2 — Job-alert digests (dedup via digestSent ledger)
// ---------------------------------------------------------------------------
export async function createDigestRun(savedSearchId: number, userId: number, frequency: "daily" | "weekly", windowStart: Date, windowEnd: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [res] = await db.insert(digestRuns).values({ savedSearchId, userId, frequency, windowStart, windowEnd });
  return Number((res as any).insertId);
}

export async function findMatchingJobsForDigest(query: any, savedSearchId: number, windowStart: Date, windowEnd: Date) {
  const db = await getDb();
  if (!db) return [];
  // Already-sent jobs for this saved search (across any run — the dedup ledger)
  const [sent]: [unknown, unknown] = await db.execute(
    `SELECT jobId FROM digestSent ds INNER JOIN digestRuns dr ON dr.id = ds.digestRunId AND dr.savedSearchId = ${Number(savedSearchId)}`,
  );
  const sentIds = new Set((sent as any[]).map((r) => r.jobId));

  const skillIds: number[] = Array.isArray(query.skillIds) ? query.skillIds : [];
  const q = typeof query.query === "string" ? query.query.trim().toLowerCase() : "";
  const tokens = q ? q.split(/[\s,;]+/).filter(Boolean) : [];
  const titleOr = tokens.map((t: string) => `LOWER(j.title) LIKE '%${t.replace(/'/g, "''")}%' OR LOWER(j.description) LIKE '%${t.replace(/'/g, "''")}%'`).join(" OR ");

  const [rows]: [unknown, unknown] = await db.execute(`
    SELECT j.id, j.title FROM jobs j
    WHERE j.published = 1
      AND j.createdAt >= '${windowStart.toISOString().slice(0, 19).replace("T", " ")}'
      AND j.createdAt < '${windowEnd.toISOString().slice(0, 19).replace("T", " ")}'
      ${q ? `AND (${titleOr})` : ""}
      ${skillIds.length ? `AND j.id IN (SELECT js.jobId FROM jobSkills js WHERE js.skillId IN (${skillIds.join(",")}))` : ""}
      ${query.remotePolicy ? `AND j.remotePolicy = '${query.remotePolicy}'` : ""}
      ${query.seniority ? `AND j.seniority = '${query.seniority}'` : ""}
    ORDER BY j.createdAt DESC LIMIT 50
  `);
  return (rows as any[]).filter((r) => !sentIds.has(r.id));
}

export async function recordDigestSent(digestRunId: number, jobId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(digestSent).values({ digestRunId, jobId }).onDuplicateKeyUpdate({
    set: { createdAt: new Date() },
  });
}

export async function completeDigestRun(digestRunId: number, jobsSent: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(digestRuns).set({ status: "completed", jobsSent }).where(eq(digestRuns.id, digestRunId));
}

export async function failDigestRun(digestRunId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(digestRuns).set({ status: "failed" }).where(eq(digestRuns.id, digestRunId));
}

/** List digest runs owned by a user. */
export async function listDigestRuns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(digestRuns).where(eq(digestRuns.userId, userId)).orderBy(desc(digestRuns.createdAt)).limit(50);
}

/** Dead-letter queue contents for admin ops view. */
export async function listDeadQueueRows(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificationQueue).where(eq(notificationQueue.status, "dead")).orderBy(desc(notificationQueue.updatedAt)).limit(limit);
}

/**
 * Digest worker: for every (savedSearch × daily/weekly) schedule create one run
 * per window, find new matching jobs (dedup via digestSent), enqueue one
 * in-app + email notification per new job, and complete the run.
 * Returns { completed, jobsEnqueued, errors }.
 */
export async function runAllScheduledDigests() {
  const db = await getDb();
  if (!db) return { completed: 0, jobsEnqueued: 0, errors: 0 };
  const searches = await db.select().from(savedSearches);
  let completed = 0;
  let jobsEnqueued = 0;
  let errors = 0;
  const now = new Date();
  for (const ss of searches) {
    for (const frequency of ["daily", "weekly"] as const) {
      const windowDays = frequency === "daily" ? 1 : 7;
      const windowEnd = new Date(now.getTime());
      const windowStart = new Date(now.getTime() - windowDays * 86_400_000);
      try {
        const runId = await createDigestRun(ss.id, ss.userId, frequency, windowStart, windowEnd);
        const matches = await findMatchingJobsForDigest(ss.query, ss.id, windowStart, windowEnd);
        for (const j of matches) {
          await enqueueNotification({
            jobKey: `digest-${frequency}-${ss.id}-${j.id}`,
            channel: "email",
            recipientUserId: ss.userId,
            eventType: "digest.new_jobs",
            subject: `[HireWise ${frequency}] New job: ${j.title}`,
            payload: { savedSearchId: ss.id, savedSearchName: ss.name, jobId: j.id, title: j.title },
          });
          await enqueueNotification({
            jobKey: `digest-inapp-${frequency}-${ss.id}-${j.id}`,
            channel: "in_app",
            recipientUserId: ss.userId,
            eventType: "digest.new_jobs",
            subject: `[HireWise ${frequency}] New job: ${j.title}`,
            payload: { savedSearchId: ss.id, savedSearchName: ss.name, jobId: j.id, title: j.title },
          });
          await recordDigestSent(runId, j.id);
          jobsEnqueued++;
        }
        await completeDigestRun(runId, matches.length);
        completed++;
      } catch {
        errors++;
      }
    }
  }
  return { completed, jobsEnqueued, errors };
}

export async function listSavedSearches(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedSearches).where(eq(savedSearches.userId, userId)).orderBy(desc(savedSearches.createdAt));
}

export async function createSavedSearch(userId: number, name: string, query: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(savedSearches).values({ userId, name, query });
  const [rows]: [unknown, unknown] = await db.execute(`SELECT id FROM savedSearches ORDER BY id DESC LIMIT 1`);
  return Number((rows as any[])[0]?.id ?? 0);
}

export async function deleteSavedSearch(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const [res]: [unknown, unknown] = await db.execute(`DELETE FROM savedSearches WHERE id = ${Number(id)} AND userId = ${Number(userId)}`);
  return (res as any).affectedRows > 0;
}

// ---------------------------------------------------------------------------
// Phase 2 — Reports / moderation
// ---------------------------------------------------------------------------
export async function createReport(targetType: "job" | "profile", targetId: number, reporterUserId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(reports).values({ targetType, targetId, reporterUserId, reason });
  return { ok: true };
}

export async function listReports(status: "pending" | "resolved" | "dismissed" = "pending") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.status, status as "pending" | "resolved" | "dismissed")).orderBy(desc(reports.createdAt));
}

export async function resolveReport(id: number, status: "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) return;
  await db.update(reports).set({ status }).where(eq(reports.id, id));
}

export async function getReportableJobs(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: jobs.id, title: jobs.title, companyId: jobs.companyId, createdAt: jobs.createdAt })
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(limit);
}

export async function getReportableProfiles(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ id: candidateProfiles.id, userId: candidateProfiles.userId, headline: candidateProfiles.headline, createdAt: candidateProfiles.createdAt })
    .from(candidateProfiles)
    .orderBy(desc(candidateProfiles.createdAt))
    .limit(limit);
  return rows;
}

// ---------------------------------------------------------------------------
// Phase 2 — Spillover candidate search (jobs → candidates, same weights)
// ---------------------------------------------------------------------------
export async function rankedSearchCandidates(opts: { jobId?: number; skillIds?: number[]; locationId?: number; remotePolicy?: string; pageSize?: number }) {
  const db = await getDb();
  if (!db) return [];
  const pageSize = Math.min(opts.pageSize ?? 20, 50);
  const skillIds = opts.skillIds ?? [];
  const w = RANKING_WEIGHTS;

  const requiredOverlap = skillIds.length
    ? sql`(SELECT COUNT(*) FROM ${candidateSkills} cs WHERE cs.profileId = cp.id AND cs.skillId IN (${sql.raw(numericInList(skillIds))})) / NULLIF((SELECT COUNT(*) FROM ${jobSkills} js WHERE js.jobId = ${opts.jobId ?? -1} AND js.weight = 'required'), 0)`
    : sql`0`;
  const preferredOverlap = skillIds.length && opts.jobId
    ? sql`(SELECT COUNT(*) FROM ${candidateSkills} cs WHERE cs.profileId = cp.id AND cs.skillId IN (SELECT js.skillId FROM ${jobSkills} js WHERE js.jobId = ${opts.jobId} AND js.weight = 'preferred')) / NULLIF((SELECT COUNT(*) FROM ${jobSkills} js WHERE js.jobId = ${opts.jobId} AND js.weight = 'preferred'), 0)`
    : sql`0`;

  const [rows]: any = await db.execute(sql`
    SELECT cp.id, cp.headline, cp.yearsOfExperience, cp.remotePolicy, cp.desiredSalaryMin, cp.desiredSalaryMax,
      (${w.skills.required} * ${requiredOverlap} + ${w.skills.preferred} * ${preferredOverlap}) AS raw
    FROM candidateProfiles cp
    WHERE cp.active = 1${opts.locationId ? sql` AND cp.locationId = ${opts.locationId}` : sql``}${opts.remotePolicy ? sql` AND cp.remotePolicy = ${opts.remotePolicy}` : sql``}
      AND cp.id IN (SELECT DISTINCT cs.profileId FROM ${candidateSkills} cs)
    ORDER BY raw DESC
    LIMIT ${pageSize}
  `);
  return (rows as any[]).map((r: any) => ({
    id: r.id,
    headline: r.headline,
    yearsOfExperience: r.yearsOfExperience,
    remotePolicy: r.remotePolicy,
    desiredSalaryMin: r.desiredSalaryMin,
    desiredSalaryMax: r.desiredSalaryMax,
    matchScore: Math.min(MAX_SCORE, Math.round((Number(r.raw) || 0) * MAX_SCORE)),
  }));
}
