/**
 * server/db.ts — All database access via Prisma + PostgreSQL.
 * Replaces the previous Drizzle/MySQL implementation.
 */
import prisma from "./lib/prisma";
import type { Prisma } from "@prisma/client";
import { ENV } from "./_core/env";

export { prisma, getDb };

// ---------------------------------------------------------------------------
// Compat shim — getDb() is called from api/index.ts health check
// ---------------------------------------------------------------------------
async function getDb() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn: Date;
}) {
  return prisma.user.upsert({
    where: { openId: user.openId },
    create: {
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn,
    },
    update: {
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      loginMethod: user.loginMethod ?? undefined,
      lastSignedIn: user.lastSignedIn,
    },
  });
}

export async function getUserByOpenId(openId: string) {
  return prisma.user.findUnique({ where: { openId } });
}

export async function getUsersByIds(ids: number[]) {
  if (!ids.length) return [];
  return prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true },
  });
}

// ---------------------------------------------------------------------------
// Skill taxonomy — query-time alias resolution
// ---------------------------------------------------------------------------
export async function resolveSkillByTerm(term: string) {
  const t = term.trim().toLowerCase();
  if (!t) return null;

  // 1. exact alias match
  const aliasRow = await prisma.skillAlias.findFirst({
    where: { alias: { equals: t, mode: "insensitive" } },
    include: { skill: true },
  });
  if (aliasRow) return aliasRow.skill;

  // 2. exact canonical name
  const byName = await prisma.skill.findFirst({
    where: { name: { equals: t, mode: "insensitive" } },
  });
  if (byName) return byName;

  // 3. slug match
  const bySlug = await prisma.skill.findFirst({ where: { slug: t } });
  if (bySlug) return bySlug;

  // 4. alias contains term (fuzzy)
  const fuzzyAlias = await prisma.skillAlias.findFirst({
    where: { alias: { contains: t, mode: "insensitive" } },
    include: { skill: true },
  });
  if (fuzzyAlias) return fuzzyAlias.skill;

  // 5. canonical name contains term
  const fuzzyName = await prisma.skill.findFirst({
    where: { name: { contains: t, mode: "insensitive" } },
  });
  return fuzzyName ?? null;
}

export async function resolveSkillIdsByQuery(query: string): Promise<number[]> {
  if (!query?.trim()) return [];
  const tokens = query.split(/[\s,;]+/).filter(Boolean);
  const ids = new Set<number>();
  for (const token of tokens) {
    const skill = await resolveSkillByTerm(token);
    if (skill) ids.add(skill.id);
  }
  return Array.from(ids);
}

export async function listSkillCategories() {
  const rows = await prisma.skill.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export async function listSkillsByCategory(category: string, limit = 50) {
  return prisma.skill.findMany({ where: { category }, take: limit });
}

export async function searchSkills(term: string, limit = 20) {
  const t = term.trim();
  if (!t) return [];
  const byAlias = await prisma.skillAlias.findMany({
    where: { alias: { startsWith: t, mode: "insensitive" } },
    include: { skill: true },
    take: limit,
  });
  const seen = new Set<number>();
  const out: any[] = [];
  for (const a of byAlias) {
    if (!seen.has(a.skillId)) { seen.add(a.skillId); out.push(a.skill); }
  }
  const byName = await prisma.skill.findMany({
    where: { name: { startsWith: t, mode: "insensitive" } },
    take: limit,
  });
  for (const s of byName) {
    if (!seen.has(s.id)) out.push(s);
    seen.add(s.id);
  }
  return out.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Candidate profiles
// ---------------------------------------------------------------------------
export async function getCandidateProfileByUserId(userId: number) {
  return prisma.candidateProfile.findUnique({ where: { userId } });
}

export async function getCandidateProfileById(profileId: number) {
  return prisma.candidateProfile.findUnique({ where: { id: profileId } });
}

export async function upsertCandidateProfile(userId: number, data: any) {
  const { skills, ...rest } = data;
  const existing = await getCandidateProfileByUserId(userId);
  if (existing) {
    await prisma.candidateProfile.update({ where: { id: existing.id }, data: rest });
    return existing;
  }
  return prisma.candidateProfile.create({ data: { userId, ...rest } });
}

export async function listCandidateSkills(profileId: number) {
  const rows = await prisma.candidateSkill.findMany({
    where: { profileId },
    include: { skill: { select: { name: true, category: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    proficiency: r.proficiency,
    years: r.years,
    skillId: r.skillId,
    name: r.skill.name,
    category: r.skill.category,
  }));
}

export async function listWorkExperiences(profileId: number) {
  return prisma.workExperience.findMany({
    where: { profileId },
    orderBy: { startDate: "desc" },
  });
}

export async function listEducation(profileId: number) {
  return prisma.education.findMany({ where: { profileId } });
}

// ---------------------------------------------------------------------------
// Profile draft
// ---------------------------------------------------------------------------
export async function getProfileDraft(userId: number) {
  return prisma.profileDraft.findUnique({ where: { userId } });
}

export async function saveProfileDraft(userId: number, currentStep: number, stepData: any) {
  return prisma.profileDraft.upsert({
    where: { userId },
    create: { userId, currentStep, stepData },
    update: { currentStep, stepData },
  });
}

export async function clearProfileDraft(userId: number) {
  await prisma.profileDraft.deleteMany({ where: { userId } });
}

// ---------------------------------------------------------------------------
// Resume suggestions
// ---------------------------------------------------------------------------
export async function createResumeSuggestions(profileId: number, suggestions: any[]) {
  return prisma.resumeSuggestion.createMany({
    data: suggestions.map((s) => ({ profileId, kind: s.kind, data: s.data })),
  });
}

export async function listResumeSuggestions(profileId: number) {
  return prisma.resumeSuggestion.findMany({ where: { profileId } });
}

export async function updateResumeSuggestionStatus(id: number, status: "confirmed" | "rejected") {
  return prisma.resumeSuggestion.update({ where: { id }, data: { status } });
}

export async function applyConfirmedSuggestion(suggestion: any) {
  if (suggestion.kind === "workExperience") {
    const d = suggestion.data as any;
    await prisma.workExperience.create({
      data: {
        profileId: suggestion.profileId,
        title: d.title ?? "Unknown role",
        company: d.company ?? "Unknown company",
        startDate: d.startDate ?? null,
        endDate: d.endDate ?? null,
        current: d.current ?? false,
        description: d.description ?? null,
      },
    });
  } else if (suggestion.kind === "education") {
    const d = suggestion.data as any;
    await prisma.education.create({
      data: {
        profileId: suggestion.profileId,
        institution: d.institution ?? "Unknown institution",
        degree: d.degree ?? "Unknown degree",
        fieldOfStudy: d.fieldOfStudy ?? null,
        startYear: d.startYear ?? null,
        endYear: d.endYear ?? null,
      },
    });
  } else if (suggestion.kind === "skill") {
    const d = suggestion.data as any;
    const skill = await resolveSkillByTerm(d.name);
    if (skill) {
      const existing = await prisma.candidateSkill.findFirst({
        where: { profileId: suggestion.profileId, skillId: skill.id },
      });
      if (!existing) {
        await prisma.candidateSkill.create({
          data: {
            profileId: suggestion.profileId,
            skillId: skill.id,
            proficiency: d.proficiency ?? "intermediate",
            years: d.years ?? 0,
          },
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Jobs — browse + ranked search
// ---------------------------------------------------------------------------
export async function getPublishedJobs({ page = 1, pageSize = 20, query, locationId, remotePolicy, seniority, minSalary, maxSalary }: any = {}) {
  const where: Prisma.JobWhereInput = { published: true };
  if (locationId) where.locationId = locationId;
  if (remotePolicy) where.remotePolicy = remotePolicy;
  if (seniority) where.seniority = seniority;
  if (minSalary) where.salaryMax = { gte: minSalary };
  if (maxSalary) where.salaryMin = { lte: maxSalary };

  let skillIds: number[] = [];
  if (query?.trim()) {
    skillIds = await resolveSkillIdsByQuery(query);
    if (skillIds.length > 0) {
      where.skills = { some: { skillId: { in: skillIds } } };
    } else {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
  }

  const [total, rows] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        location: true,
        skills: { include: { skill: true } },
      },
    }),
  ]);

  return { rows, total, skillQuery: skillIds };
}

export async function getJobSkills(jobId: number) {
  return prisma.jobSkill.findMany({ where: { jobId } });
}

export async function getJobById(jobId: number) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: true,
      location: true,
      skills: { include: { skill: true } },
    },
  });
}

export async function listLocations() {
  return prisma.location.findMany({ orderBy: { displayName: "asc" } });
}

export async function getLocationById(locationId: number) {
  return prisma.location.findUnique({ where: { id: locationId } });
}

// ---------------------------------------------------------------------------
// Ranked search — PostgreSQL ILIKE-based with skill overlap scoring
// ---------------------------------------------------------------------------

type RankSearchOptions = {
  query?: string;
  skillIds?: number[];
  locationId?: number;
  remotePolicy?: string;
  seniority?: string;
  minSalary?: number;
  maxSalary?: number;
  candidateLat?: number;
  candidateLng?: number;
  cursor?: [number, number] | null;
  pageSize?: number;
};

const MAX_SCORE = 100;

export async function rankedSearchJobs(opts: RankSearchOptions): Promise<{
  rows: any[];
  nextCursor: [number, number] | null;
  totalExact: number;
  totalWithTypo: number;
}> {
  const pageSize = Math.min(opts.pageSize ?? 20, 50);
  const skillIds = opts.skillIds ?? (opts.query ? await resolveSkillIdsByQuery(opts.query) : []);

  const where: Prisma.JobWhereInput = { published: true };
  if (opts.locationId) where.locationId = opts.locationId;
  if (opts.remotePolicy) where.remotePolicy = opts.remotePolicy as any;
  if (opts.seniority) where.seniority = opts.seniority as any;
  if (opts.minSalary) where.salaryMax = { gte: opts.minSalary };
  if (opts.maxSalary) where.salaryMin = { lte: opts.maxSalary };

  const q = opts.query?.trim().toLowerCase() ?? "";

  if (skillIds.length > 0) {
    where.skills = { some: { skillId: { in: skillIds } } };
  } else if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      location: { select: { city: true, country: true } },
      skills: { select: { skillId: true, weight: true } },
    },
  });

  // Score each job
  const scored = jobs.map((job) => {
    const jobSkillIds = job.skills.map((s) => s.skillId);
    const required = job.skills.filter((s) => s.weight === "required");
    const preferred = job.skills.filter((s) => s.weight === "preferred");

    const reqMatch = required.length
      ? required.filter((s) => skillIds.includes(s.skillId)).length / required.length
      : skillIds.length > 0 ? 0 : 0.5;
    const prefMatch = preferred.length
      ? preferred.filter((s) => skillIds.includes(s.skillId)).length / preferred.length
      : 0;

    const titleMatch = q && job.title.toLowerCase().includes(q) ? 1 : 0;
    const bodyMatch = q && job.description.toLowerCase().includes(q) ? 0.5 : 0;

    const daysSincePosted = (Date.now() - job.createdAt.getTime()) / 86400000;
    const recency = Math.pow(2, -daysSincePosted / 30);

    const salaryScore = (!opts.minSalary && !opts.maxSalary) ? 1
      : (job.salaryMax !== null && job.salaryMin !== null
        && Number(job.salaryMax) >= (opts.minSalary ?? 0)
        && Number(job.salaryMin) <= (opts.maxSalary ?? 1e9)) ? 1 : 0;

    const raw = 0.25 * titleMatch + 0.1 * bodyMatch + 0.35 * reqMatch + 0.1 * prefMatch + 0.1 * recency + 0.1 * salaryScore;

    return {
      id: job.id,
      title: job.title,
      raw,
      score: Math.min(MAX_SCORE, Math.round(raw * MAX_SCORE)),
      text: Math.round((titleMatch * 0.25 + bodyMatch * 0.1) * 100),
      skills: Math.round((reqMatch * 0.35 + prefMatch * 0.1) * 100),
      distance: 50,
      recency: Math.round(recency * 10),
      salary: Math.round(salaryScore * 10),
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      locationName: [job.location?.city, job.location?.country].filter(Boolean).join(", ") || null,
      companyName: job.company.name,
      remotePolicy: job.remotePolicy,
      seniority: job.seniority,
      postedDaysAgo: Math.floor(daysSincePosted),
    };
  });

  const sorted = scored.sort((a, b) => b.raw - a.raw || b.id - a.id);
  const totalExact = sorted.length;

  let paged = sorted;
  if (opts.cursor) {
    const idx = sorted.findIndex((r) => r.raw < opts.cursor![0] || (r.raw === opts.cursor![0] && r.id < opts.cursor![1]));
    if (idx >= 0) paged = sorted.slice(idx);
  }

  const rows = paged.slice(0, pageSize);
  const nextCursor: [number, number] | null =
    rows.length === pageSize && paged.length > pageSize
      ? [rows[rows.length - 1].raw, rows[rows.length - 1].id]
      : null;

  return { rows, nextCursor, totalExact, totalWithTypo: totalExact };
}

// ---------------------------------------------------------------------------
// Facet counts for the /jobs sidebar
// ---------------------------------------------------------------------------
type FacetCounts = {
  remote: Record<string, number>;
  seniority: Record<string, number>;
  salaryBucket: Record<string, number>;
};

export async function facetCountsForJobs(opts: RankSearchOptions): Promise<FacetCounts> {
  const skillIds = opts.skillIds ?? [];
  const where: Prisma.JobWhereInput = { published: true };
  if (opts.locationId) where.locationId = opts.locationId;
  if (opts.minSalary) where.salaryMax = { gte: opts.minSalary };
  if (opts.maxSalary) where.salaryMin = { lte: opts.maxSalary };

  if (skillIds.length > 0) {
    where.skills = { some: { skillId: { in: skillIds } } };
  } else if (opts.query?.trim()) {
    where.OR = [
      { title: { contains: opts.query, mode: "insensitive" } },
      { description: { contains: opts.query, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.job.findMany({
    where,
    select: { remotePolicy: true, seniority: true, salaryMax: true },
    take: 10000,
  });

  const remote: Record<string, number> = {};
  const seniority: Record<string, number> = {};
  const salaryBucket: Record<string, number> = {};

  for (const r of rows) {
    if (r.remotePolicy) remote[r.remotePolicy] = (remote[r.remotePolicy] ?? 0) + 1;
    if (r.seniority) seniority[r.seniority] = (seniority[r.seniority] ?? 0) + 1;
    const max = r.salaryMax ? Number(r.salaryMax) : null;
    if (max !== null) {
      const bucket = max < 50000 ? "under-50k" : max < 100000 ? "50k-100k" : max < 150000 ? "100k-150k" : "over-150k";
      salaryBucket[bucket] = (salaryBucket[bucket] ?? 0) + 1;
    }
  }

  return { remote, seniority, salaryBucket };
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------
export async function createCompany(data: any, userId: number) {
  const company = await prisma.company.create({ data });
  await prisma.companyMember.create({ data: { userId, companyId: company.id, role: "owner" } });
  return company;
}

export async function getCompanyById(companyId: number) {
  return prisma.company.findUnique({ where: { id: companyId } });
}

export async function getMyCompanyMembership(userId: number) {
  return prisma.companyMember.findFirst({
    where: { userId },
    select: { id: true, companyId: true, role: true },
  });
}

export async function getUserCompanies(userId: number) {
  const memberships = await prisma.companyMember.findMany({ where: { userId } });
  if (!memberships.length) return [];
  const companies = await prisma.company.findMany({
    where: { id: { in: memberships.map((m) => m.companyId) } },
  });
  return companies.map((c) => ({ ...c, membership: memberships.find((m) => m.companyId === c.id) }));
}

export async function getCompanyOwner(companyId: number) {
  const row = await prisma.companyMember.findFirst({
    where: { companyId },
    orderBy: { id: "asc" },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

export async function getCompanyPublishedJobs(companyId: number) {
  return prisma.job.findMany({
    where: { companyId, published: true },
    orderBy: { createdAt: "desc" },
    include: {
      skills: { include: { skill: true } },
      location: true,
    },
  });
}

export async function getCompanyJobs(companyId: number) {
  return prisma.job.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { skills: { include: { skill: true } } },
  });
}

export async function createJob(data: any) {
  const { skills, ...rest } = data;
  const job = await prisma.job.create({ data: rest });
  if (skills?.length) {
    await prisma.jobSkill.createMany({
      data: skills.map((s: any) => ({ jobId: job.id, skillId: s.skillId, weight: s.weight })),
    });
  }
  return job.id;
}

export async function updateJob(jobId: number, data: any) {
  const { skills, ...rest } = data;
  await prisma.job.update({ where: { id: jobId }, data: rest });
  if (skills) {
    await prisma.jobSkill.deleteMany({ where: { jobId } });
    if (skills.length) {
      await prisma.jobSkill.createMany({
        data: skills.map((s: any) => ({ jobId, skillId: s.skillId, weight: s.weight })),
      });
    }
  }
}

export async function updateJobPublishState(jobId: number, published: boolean) {
  await prisma.job.update({ where: { id: jobId }, data: { published } });
  return { jobId, published };
}

export async function deleteJob(jobId: number) {
  await prisma.jobSkill.deleteMany({ where: { jobId } });
  await prisma.application.deleteMany({ where: { jobId } });
  await prisma.job.delete({ where: { id: jobId } });
}

export async function getApplicationStatsForJobs(jobIds: number[]) {
  if (!jobIds.length) return {};
  const counts = await prisma.application.groupBy({
    by: ["jobId"],
    where: { jobId: { in: jobIds } },
    _count: { id: true },
  });
  const out: Record<number, number> = {};
  for (const c of counts) out[c.jobId] = c._count.id;
  return out;
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------
export async function applyToJob(jobId: number, profileId: number, coverNote?: string) {
  const existing = await prisma.application.findFirst({ where: { jobId, profileId } });
  if (existing) return existing;
  const app = await prisma.application.create({ data: { jobId, profileId, coverNote: coverNote ?? null } });
  await prisma.job.update({ where: { id: jobId }, data: { applicationCount: { increment: 1 } } });
  return app;
}

export async function getJobApplications(jobId: number) {
  return prisma.application.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: { profile: true },
  });
}

export async function getMyApplications(profileId: number) {
  return prisma.application.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    include: { job: { include: { company: true, location: true } } },
  });
}

export async function updateApplicationStatus(applicationId: number, status: any) {
  return prisma.application.update({ where: { id: applicationId }, data: { status } });
}

export async function getApplicationById(applicationId: number) {
  return prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, profile: true },
  });
}

export async function moveApplication(applicationId: number, toStatus: any, actorUserId: number, note?: string) {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) throw new Error("Application not found");
  await prisma.applicationStageEvent.create({
    data: {
      applicationId,
      fromStatus: app.status as any,
      toStatus,
      note: note ?? null,
      actorUserId,
    },
  });
  return prisma.application.update({ where: { id: applicationId }, data: { status: toStatus } });
}

export async function getStageHistory(applicationId: number) {
  return prisma.applicationStageEvent.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Profile views
// ---------------------------------------------------------------------------
export async function recordProfileView(employerUserId: number, profileId: number) {
  return prisma.profileView.create({ data: { employerUserId, profileId } });
}

export async function getProfileViewCount(profileId: number) {
  return prisma.profileView.count({ where: { profileId } });
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
export async function sendMessage(applicationId: number, senderUserId: number, text: string) {
  return prisma.message.create({ data: { applicationId, senderUserId, text } });
}

export async function getThread(applicationId: number) {
  return prisma.message.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function markMessagesRead(applicationId: number, forUserId: number) {
  await prisma.message.updateMany({
    where: { applicationId, senderUserId: { not: forUserId }, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getUnreadCounts(applicationIds: number[], forUserId: number) {
  if (!applicationIds.length) return {};
  const rows = await prisma.message.groupBy({
    by: ["applicationId"],
    where: { applicationId: { in: applicationIds }, senderUserId: { not: forUserId }, readAt: null },
    _count: { id: true },
  });
  const out: Record<number, number> = {};
  for (const r of rows) out[r.applicationId] = r._count.id;
  return out;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export async function getNotificationPrefs(userId: number, channel: "in_app" | "email", eventType: string) {
  const row = await prisma.notificationPreference.findFirst({
    where: { userId, channel, eventType },
  });
  return row?.enabled ?? true;
}

export async function setNotificationPref(userId: number, channel: "in_app" | "email", eventType: string, enabled: boolean) {
  return prisma.notificationPreference.upsert({
    where: { id: 0 }, // force create path — use findFirst + update pattern
    create: { userId, channel, eventType, enabled },
    update: { enabled },
  }).catch(async () => {
    const existing = await prisma.notificationPreference.findFirst({ where: { userId, channel, eventType } });
    if (existing) {
      return prisma.notificationPreference.update({ where: { id: existing.id }, data: { enabled } });
    }
    return prisma.notificationPreference.create({ data: { userId, channel, eventType, enabled } });
  });
}

export async function getOrCreateUnsubscribeToken(userId: number, channel: "in_app" | "email") {
  const existing = await prisma.unsubscribeToken.findFirst({
    where: { userId, channel, usedAt: null },
  });
  if (existing) return existing;
  const { nanoid } = await import("nanoid");
  return prisma.unsubscribeToken.create({
    data: { userId, channel, token: nanoid(64) },
  });
}

export async function unsubscribeByToken(token: string) {
  const row = await prisma.unsubscribeToken.findUnique({ where: { token } });
  if (!row || row.usedAt) return false;
  await prisma.unsubscribeToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  await prisma.notificationPreference.upsert({
    where: { id: 0 },
    create: { userId: row.userId, channel: row.channel, eventType: "all", enabled: false },
    update: { enabled: false },
  }).catch(async () => {
    const existing = await prisma.notificationPreference.findFirst({
      where: { userId: row.userId, channel: row.channel, eventType: "all" },
    });
    if (existing) {
      await prisma.notificationPreference.update({ where: { id: existing.id }, data: { enabled: false } });
    } else {
      await prisma.notificationPreference.create({
        data: { userId: row.userId, channel: row.channel, eventType: "all", enabled: false },
      });
    }
  });
  return true;
}

export async function enqueueNotification(opts: {
  jobKey: string;
  channel: "in_app" | "email";
  recipientUserId: number;
  eventType: string;
  subject?: string;
  payload: Record<string, unknown>;
}) {
  return prisma.notificationQueue.upsert({
    where: { jobKey: opts.jobKey },
    create: {
      jobKey: opts.jobKey,
      channel: opts.channel,
      recipientUserId: opts.recipientUserId,
      eventType: opts.eventType,
      subject: opts.subject ?? null,
      payload: opts.payload,
      status: "pending",
    },
    update: {},
  });
}

export async function listNotifications(userId: number, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: number, userId: number) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: number) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getUnreadNotificationCount(userId: number) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

// ---------------------------------------------------------------------------
// Queue worker
// ---------------------------------------------------------------------------
export async function claimQueueBatch(batchSize = 20) {
  const rows = await prisma.notificationQueue.findMany({
    where: {
      status: { in: ["pending", "failed"] },
      OR: [{ backoffUntil: null }, { backoffUntil: { lte: new Date() } }],
    },
    take: batchSize,
    orderBy: { createdAt: "asc" },
  });
  const ids = rows.map((r) => r.id);
  if (ids.length) {
    await prisma.notificationQueue.updateMany({ where: { id: { in: ids } }, data: { status: "processing" } });
  }
  return rows;
}

export async function markQueueSent(queueId: number, emailLog: any) {
  await prisma.notificationQueue.update({ where: { id: queueId }, data: { status: "sent" } });
  await prisma.emailSendLog.create({ data: emailLog });
}

export async function markQueueFailed(queueId: number, error: string, retryCount: number) {
  const MAX_RETRIES = 5;
  const dead = retryCount >= MAX_RETRIES;
  const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 3_600_000);
  await prisma.notificationQueue.update({
    where: { id: queueId },
    data: {
      status: dead ? "dead" : "failed",
      retryCount: retryCount + 1,
      lastError: error,
      backoffUntil: dead ? null : new Date(Date.now() + backoffMs),
    },
  });
  return { dead, retryCount: retryCount + 1 };
}

function emailTemplate(subject: string, payload: Record<string, unknown>): string {
  const rows = Object.entries(payload).slice(0, 8)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #e5e7eb">${k}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${String(v)}</td></tr>`)
    .join("");
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#1a2744">${subject}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
<p style="margin-top:24px;color:#6b7280;font-size:12px">HireWise · Manage notifications from your settings.</p>
</body></html>`;
}

export async function runQueueWorker(batchSize = 20) {
  const batch = await claimQueueBatch(batchSize);
  const results: any[] = [];
  for (const row of batch) {
    const payload = (typeof row.payload === "object" ? row.payload : JSON.parse(row.payload as string)) as Record<string, unknown>;
    const users = await getUsersByIds([row.recipientUserId]);
    const recipientEmail = users[0]?.email ?? null;
    let outcome = "logged_only";
    let providerResponse: string | null = null;
    try {
      if (!recipientEmail) {
        outcome = "skipped_no_email";
      } else if (process.env.RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "HireWise <onboarding@resend.dev>", to: [recipientEmail], subject: row.subject ?? "HireWise notification", html: emailTemplate(row.subject ?? "HireWise notification", payload) }),
        });
        if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
        outcome = "sent";
        providerResponse = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      const res = await markQueueFailed(row.id, String(e?.message ?? e).slice(0, 2000), row.retryCount ?? 0);
      results.push({ queueId: row.id, status: res.dead ? "dead" : "failed", retryCount: res.retryCount });
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

export async function getQueueStats() {
  const counts = await prisma.notificationQueue.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const out: Record<string, number> = {};
  for (const c of counts) out[c.status] = c._count.id;
  return out;
}

export async function listDeadQueueRows(limit = 50) {
  return prisma.notificationQueue.findMany({
    where: { status: "dead" },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// Saved searches
// ---------------------------------------------------------------------------
export async function listSavedSearches(userId: number) {
  return prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function createSavedSearch(userId: number, name: string, query: Record<string, unknown>) {
  const row = await prisma.savedSearch.create({ data: { userId, name, query } });
  return row.id;
}

export async function deleteSavedSearch(id: number, userId: number) {
  const row = await prisma.savedSearch.findFirst({ where: { id, userId } });
  if (!row) return false;
  await prisma.savedSearch.delete({ where: { id } });
  return true;
}

// ---------------------------------------------------------------------------
// Reports / moderation
// ---------------------------------------------------------------------------
export async function createReport(targetType: "job" | "profile", targetId: number, reporterUserId: number, reason: string) {
  return prisma.report.create({ data: { targetType, targetId, reporterUserId, reason } });
}

export async function listReports(status: "pending" | "resolved" | "dismissed" = "pending") {
  return prisma.report.findMany({ where: { status }, orderBy: { createdAt: "desc" } });
}

export async function resolveReport(id: number, status: "resolved" | "dismissed") {
  return prisma.report.update({ where: { id }, data: { status } });
}

export async function getReportableJobs(limit = 200) {
  return prisma.job.findMany({ where: { published: true }, take: limit, select: { id: true, title: true } });
}

export async function getReportableProfiles(limit = 200) {
  return prisma.candidateProfile.findMany({ take: limit, select: { id: true, headline: true } });
}

// ---------------------------------------------------------------------------
// Digests
// ---------------------------------------------------------------------------
export function logEvent(event: string, payload: Record<string, unknown>, level = "info") {
  if (level === "error") console.error(`[digest] ${event}`, payload);
  else console.log(`[digest] ${event}`, payload);
}

export async function createDigestRun(savedSearchId: number, userId: number, frequency: "daily" | "weekly", windowStart: Date, windowEnd: Date) {
  return prisma.digestRun.create({ data: { savedSearchId, userId, frequency, windowStart, windowEnd } });
}

export async function findMatchingJobsForDigest(query: any, savedSearchId: number, windowStart: Date, windowEnd: Date) {
  const skillIds = query.query ? await resolveSkillIdsByQuery(query.query) : [];
  const where: Prisma.JobWhereInput = {
    published: true,
    createdAt: { gte: windowStart, lte: windowEnd },
    NOT: { digestSent: { some: { digestRun: { savedSearchId } } } },
  };
  if (skillIds.length) where.skills = { some: { skillId: { in: skillIds } } };
  if (query.remotePolicy) where.remotePolicy = query.remotePolicy;
  if (query.seniority) where.seniority = query.seniority;
  return prisma.job.findMany({ where, take: 20, include: { company: true, location: true } });
}

export async function recordDigestSent(digestRunId: number, jobId: number) {
  return prisma.digestSent.create({ data: { digestRunId, jobId } });
}

export async function completeDigestRun(digestRunId: number, jobsSent: number) {
  return prisma.digestRun.update({ where: { id: digestRunId }, data: { status: "completed", jobsSent } });
}

export async function failDigestRun(digestRunId: number) {
  return prisma.digestRun.update({ where: { id: digestRunId }, data: { status: "failed" } });
}

export async function listDigestRuns(userId: number) {
  return prisma.digestRun.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function runAllScheduledDigests() {
  const searches = await prisma.savedSearch.findMany({ include: { user: true } });
  const now = new Date();
  const results: any[] = [];
  for (const ss of searches) {
    try {
      const windowStart = new Date(now.getTime() - 24 * 3600 * 1000);
      const run = await createDigestRun(ss.id, ss.userId, "daily", windowStart, now);
      const jobs = await findMatchingJobsForDigest(ss.query, ss.id, windowStart, now);
      for (const job of jobs) {
        await enqueueNotification({
          jobKey: `digest:${ss.id}:${job.id}:${run.id}`,
          channel: "email",
          recipientUserId: ss.userId,
          eventType: "job_digest",
          subject: `New job match: ${job.title}`,
          payload: { jobId: job.id, title: job.title, company: (job as any).company?.name },
        });
        await recordDigestSent(run.id, job.id);
      }
      await completeDigestRun(run.id, jobs.length);
      results.push({ savedSearchId: ss.id, jobsSent: jobs.length });
    } catch (e: any) {
      logEvent("digest_error", { savedSearchId: ss.id, error: e?.message }, "error");
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Candidate ranked search (employer side)
// ---------------------------------------------------------------------------
export async function rankedSearchCandidates(opts: { jobId?: number; skillIds?: number[]; locationId?: number; remotePolicy?: string; pageSize?: number }) {
  const pageSize = Math.min(opts.pageSize ?? 20, 50);
  const where: Prisma.CandidateProfileWhereInput = { active: true };
  if (opts.locationId) where.locationId = opts.locationId;
  if (opts.remotePolicy) where.remotePolicy = opts.remotePolicy as any;
  if (opts.skillIds?.length) {
    where.skills = { some: { skillId: { in: opts.skillIds } } };
  }
  const profiles = await prisma.candidateProfile.findMany({
    where,
    take: pageSize,
    include: { skills: true, location: true, user: { select: { name: true } } },
  });
  return profiles.map((p) => {
    const matchCount = opts.skillIds?.filter((id) => p.skills.some((s) => s.skillId === id)).length ?? 0;
    const total = opts.skillIds?.length ?? 1;
    return { ...p, score: Math.round((matchCount / total) * 100) };
  });
}
