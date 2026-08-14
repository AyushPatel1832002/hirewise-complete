var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/const.ts
var COOKIE_NAME, ONE_YEAR_MS, AXIOS_TIMEOUT_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG, OAUTH_STATE_COOKIE, decodeOAuthState;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    AXIOS_TIMEOUT_MS = 3e4;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
    OAUTH_STATE_COOKIE = "__Host-oauth_state";
    decodeOAuthState = (state) => {
      let decoded;
      try {
        decoded = atob(state);
      } catch {
        return { redirectUri: "" };
      }
      try {
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed.redirectUri === "string") return parsed;
      } catch {
      }
      return { redirectUri: decoded };
    };
  }
});

// server/lib/prisma.ts
var prisma_exports = {};
__export(prisma_exports, {
  default: () => prisma_default,
  prisma: () => prisma
});
import { PrismaClient } from "@prisma/client";
var globalForPrisma, prisma, prisma_default;
var init_prisma = __esm({
  "server/lib/prisma.ts"() {
    "use strict";
    globalForPrisma = globalThis;
    prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
    prisma_default = prisma;
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  applyConfirmedSuggestion: () => applyConfirmedSuggestion,
  applyToJob: () => applyToJob,
  claimQueueBatch: () => claimQueueBatch,
  clearProfileDraft: () => clearProfileDraft,
  completeDigestRun: () => completeDigestRun,
  createCompany: () => createCompany,
  createDigestRun: () => createDigestRun,
  createJob: () => createJob,
  createReport: () => createReport,
  createResumeSuggestions: () => createResumeSuggestions,
  createSavedSearch: () => createSavedSearch,
  deleteJob: () => deleteJob,
  deleteSavedSearch: () => deleteSavedSearch,
  enqueueNotification: () => enqueueNotification,
  facetCountsForJobs: () => facetCountsForJobs,
  failDigestRun: () => failDigestRun,
  findMatchingJobsForDigest: () => findMatchingJobsForDigest,
  getApplicationById: () => getApplicationById,
  getApplicationStatsForJobs: () => getApplicationStatsForJobs,
  getCandidateProfileById: () => getCandidateProfileById,
  getCandidateProfileByUserId: () => getCandidateProfileByUserId,
  getCompanyById: () => getCompanyById,
  getCompanyJobs: () => getCompanyJobs,
  getCompanyOwner: () => getCompanyOwner,
  getCompanyPublishedJobs: () => getCompanyPublishedJobs,
  getDb: () => getDb2,
  getJobApplications: () => getJobApplications,
  getJobById: () => getJobById,
  getJobSkills: () => getJobSkills,
  getLocationById: () => getLocationById,
  getMyApplications: () => getMyApplications,
  getMyCompanyMembership: () => getMyCompanyMembership,
  getNotificationPrefs: () => getNotificationPrefs,
  getOrCreateUnsubscribeToken: () => getOrCreateUnsubscribeToken,
  getProfileDraft: () => getProfileDraft,
  getProfileViewCount: () => getProfileViewCount,
  getPublishedJobs: () => getPublishedJobs,
  getQueueStats: () => getQueueStats,
  getReportableJobs: () => getReportableJobs,
  getReportableProfiles: () => getReportableProfiles,
  getStageHistory: () => getStageHistory,
  getThread: () => getThread,
  getUnreadCounts: () => getUnreadCounts,
  getUnreadNotificationCount: () => getUnreadNotificationCount,
  getUserByOpenId: () => getUserByOpenId,
  getUserCompanies: () => getUserCompanies,
  getUsersByIds: () => getUsersByIds,
  listCandidateSkills: () => listCandidateSkills,
  listDeadQueueRows: () => listDeadQueueRows,
  listDigestRuns: () => listDigestRuns,
  listEducation: () => listEducation,
  listLocations: () => listLocations,
  listNotifications: () => listNotifications,
  listReports: () => listReports,
  listResumeSuggestions: () => listResumeSuggestions,
  listSavedSearches: () => listSavedSearches,
  listSkillCategories: () => listSkillCategories,
  listSkillsByCategory: () => listSkillsByCategory,
  listWorkExperiences: () => listWorkExperiences,
  logEvent: () => logEvent,
  markAllNotificationsRead: () => markAllNotificationsRead,
  markMessagesRead: () => markMessagesRead,
  markNotificationRead: () => markNotificationRead,
  markQueueFailed: () => markQueueFailed,
  markQueueSent: () => markQueueSent,
  moveApplication: () => moveApplication,
  prisma: () => prisma_default,
  rankedSearchCandidates: () => rankedSearchCandidates,
  rankedSearchJobs: () => rankedSearchJobs,
  recordDigestSent: () => recordDigestSent,
  recordProfileView: () => recordProfileView,
  resolveReport: () => resolveReport,
  resolveSkillByTerm: () => resolveSkillByTerm,
  resolveSkillIdsByQuery: () => resolveSkillIdsByQuery,
  runAllScheduledDigests: () => runAllScheduledDigests,
  runQueueWorker: () => runQueueWorker,
  saveProfileDraft: () => saveProfileDraft,
  searchSkills: () => searchSkills,
  sendMessage: () => sendMessage,
  setNotificationPref: () => setNotificationPref,
  unsubscribeByToken: () => unsubscribeByToken,
  updateApplicationStatus: () => updateApplicationStatus,
  updateJob: () => updateJob,
  updateJobPublishState: () => updateJobPublishState,
  updateResumeSuggestionStatus: () => updateResumeSuggestionStatus,
  upsertCandidateProfile: () => upsertCandidateProfile,
  upsertUser: () => upsertUser
});
async function getDb2() {
  try {
    await prisma_default.$queryRaw`SELECT 1`;
    return prisma_default;
  } catch {
    return null;
  }
}
async function upsertUser(user) {
  return prisma_default.user.upsert({
    where: { openId: user.openId },
    create: {
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn
    },
    update: {
      name: user.name ?? void 0,
      email: user.email ?? void 0,
      loginMethod: user.loginMethod ?? void 0,
      lastSignedIn: user.lastSignedIn
    }
  });
}
async function getUserByOpenId(openId) {
  return prisma_default.user.findUnique({ where: { openId } });
}
async function getUsersByIds(ids) {
  if (!ids.length) return [];
  return prisma_default.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true }
  });
}
async function resolveSkillByTerm(term) {
  const t2 = term.trim().toLowerCase();
  if (!t2) return null;
  const aliasRow = await prisma_default.skillAlias.findFirst({
    where: { alias: { equals: t2, mode: "insensitive" } },
    include: { skill: true }
  });
  if (aliasRow) return aliasRow.skill;
  const byName = await prisma_default.skill.findFirst({
    where: { name: { equals: t2, mode: "insensitive" } }
  });
  if (byName) return byName;
  const bySlug = await prisma_default.skill.findFirst({ where: { slug: t2 } });
  if (bySlug) return bySlug;
  const fuzzyAlias = await prisma_default.skillAlias.findFirst({
    where: { alias: { contains: t2, mode: "insensitive" } },
    include: { skill: true }
  });
  if (fuzzyAlias) return fuzzyAlias.skill;
  const fuzzyName = await prisma_default.skill.findFirst({
    where: { name: { contains: t2, mode: "insensitive" } }
  });
  return fuzzyName ?? null;
}
async function resolveSkillIdsByQuery(query) {
  if (!query?.trim()) return [];
  const tokens = query.split(/[\s,;]+/).filter(Boolean);
  const ids = /* @__PURE__ */ new Set();
  for (const token of tokens) {
    const skill = await resolveSkillByTerm(token);
    if (skill) ids.add(skill.id);
  }
  return Array.from(ids);
}
async function listSkillCategories() {
  const rows = await prisma_default.skill.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" }
  });
  return rows.map((r) => r.category);
}
async function listSkillsByCategory(category, limit = 50) {
  return prisma_default.skill.findMany({ where: { category }, take: limit });
}
async function searchSkills(term, limit = 20) {
  const t2 = term.trim();
  if (!t2) return [];
  const byAlias = await prisma_default.skillAlias.findMany({
    where: { alias: { startsWith: t2, mode: "insensitive" } },
    include: { skill: true },
    take: limit
  });
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const a of byAlias) {
    if (!seen.has(a.skillId)) {
      seen.add(a.skillId);
      out.push(a.skill);
    }
  }
  const byName = await prisma_default.skill.findMany({
    where: { name: { startsWith: t2, mode: "insensitive" } },
    take: limit
  });
  for (const s of byName) {
    if (!seen.has(s.id)) out.push(s);
    seen.add(s.id);
  }
  return out.slice(0, limit);
}
async function getCandidateProfileByUserId(userId) {
  return prisma_default.candidateProfile.findUnique({ where: { userId } });
}
async function getCandidateProfileById(profileId) {
  return prisma_default.candidateProfile.findUnique({ where: { id: profileId } });
}
async function upsertCandidateProfile(userId, data) {
  const { skills, ...rest } = data;
  const existing = await getCandidateProfileByUserId(userId);
  if (existing) {
    await prisma_default.candidateProfile.update({ where: { id: existing.id }, data: rest });
    return existing;
  }
  return prisma_default.candidateProfile.create({ data: { userId, ...rest } });
}
async function listCandidateSkills(profileId) {
  const rows = await prisma_default.candidateSkill.findMany({
    where: { profileId },
    include: { skill: { select: { name: true, category: true } } }
  });
  return rows.map((r) => ({
    id: r.id,
    proficiency: r.proficiency,
    years: r.years,
    skillId: r.skillId,
    name: r.skill.name,
    category: r.skill.category
  }));
}
async function listWorkExperiences(profileId) {
  return prisma_default.workExperience.findMany({
    where: { profileId },
    orderBy: { startDate: "desc" }
  });
}
async function listEducation(profileId) {
  return prisma_default.education.findMany({ where: { profileId } });
}
async function getProfileDraft(userId) {
  return prisma_default.profileDraft.findUnique({ where: { userId } });
}
async function saveProfileDraft(userId, currentStep, stepData) {
  return prisma_default.profileDraft.upsert({
    where: { userId },
    create: { userId, currentStep, stepData },
    update: { currentStep, stepData }
  });
}
async function clearProfileDraft(userId) {
  await prisma_default.profileDraft.deleteMany({ where: { userId } });
}
async function createResumeSuggestions(profileId, suggestions) {
  return prisma_default.resumeSuggestion.createMany({
    data: suggestions.map((s) => ({ profileId, kind: s.kind, data: s.data }))
  });
}
async function listResumeSuggestions(profileId) {
  return prisma_default.resumeSuggestion.findMany({ where: { profileId } });
}
async function updateResumeSuggestionStatus(id, status) {
  return prisma_default.resumeSuggestion.update({ where: { id }, data: { status } });
}
async function applyConfirmedSuggestion(suggestion) {
  if (suggestion.kind === "workExperience") {
    const d = suggestion.data;
    await prisma_default.workExperience.create({
      data: {
        profileId: suggestion.profileId,
        title: d.title ?? "Unknown role",
        company: d.company ?? "Unknown company",
        startDate: d.startDate ?? null,
        endDate: d.endDate ?? null,
        current: d.current ?? false,
        description: d.description ?? null
      }
    });
  } else if (suggestion.kind === "education") {
    const d = suggestion.data;
    await prisma_default.education.create({
      data: {
        profileId: suggestion.profileId,
        institution: d.institution ?? "Unknown institution",
        degree: d.degree ?? "Unknown degree",
        fieldOfStudy: d.fieldOfStudy ?? null,
        startYear: d.startYear ?? null,
        endYear: d.endYear ?? null
      }
    });
  } else if (suggestion.kind === "skill") {
    const d = suggestion.data;
    const skill = await resolveSkillByTerm(d.name);
    if (skill) {
      const existing = await prisma_default.candidateSkill.findFirst({
        where: { profileId: suggestion.profileId, skillId: skill.id }
      });
      if (!existing) {
        await prisma_default.candidateSkill.create({
          data: {
            profileId: suggestion.profileId,
            skillId: skill.id,
            proficiency: d.proficiency ?? "intermediate",
            years: d.years ?? 0
          }
        });
      }
    }
  }
}
async function getPublishedJobs({ page = 1, pageSize = 20, query, locationId, remotePolicy, seniority, minSalary, maxSalary } = {}) {
  const where = { published: true };
  if (locationId) where.locationId = locationId;
  if (remotePolicy) where.remotePolicy = remotePolicy;
  if (seniority) where.seniority = seniority;
  if (minSalary) where.salaryMax = { gte: minSalary };
  if (maxSalary) where.salaryMin = { lte: maxSalary };
  let skillIds = [];
  if (query?.trim()) {
    skillIds = await resolveSkillIdsByQuery(query);
    if (skillIds.length > 0) {
      where.skills = { some: { skillId: { in: skillIds } } };
    } else {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ];
    }
  }
  const [total, rows] = await Promise.all([
    prisma_default.job.count({ where }),
    prisma_default.job.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        location: true,
        skills: { include: { skill: true } }
      }
    })
  ]);
  return { rows, total, skillQuery: skillIds };
}
async function getJobSkills(jobId) {
  return prisma_default.jobSkill.findMany({ where: { jobId } });
}
async function getJobById(jobId) {
  return prisma_default.job.findUnique({
    where: { id: jobId },
    include: {
      company: true,
      location: true,
      skills: { include: { skill: true } }
    }
  });
}
async function listLocations() {
  return prisma_default.location.findMany({ orderBy: { displayName: "asc" } });
}
async function getLocationById(locationId) {
  return prisma_default.location.findUnique({ where: { id: locationId } });
}
async function rankedSearchJobs(opts) {
  const pageSize = Math.min(opts.pageSize ?? 20, 50);
  const skillIds = opts.skillIds ?? (opts.query ? await resolveSkillIdsByQuery(opts.query) : []);
  const where = { published: true };
  if (opts.locationId) where.locationId = opts.locationId;
  if (opts.remotePolicy) where.remotePolicy = opts.remotePolicy;
  if (opts.seniority) where.seniority = opts.seniority;
  if (opts.minSalary) where.salaryMax = { gte: opts.minSalary };
  if (opts.maxSalary) where.salaryMin = { lte: opts.maxSalary };
  const q = opts.query?.trim().toLowerCase() ?? "";
  if (skillIds.length > 0) {
    where.skills = { some: { skillId: { in: skillIds } } };
  } else if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }
  const jobs = await prisma_default.job.findMany({
    where,
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      location: { select: { city: true, country: true } },
      skills: { select: { skillId: true, weight: true } }
    }
  });
  const scored = jobs.map((job) => {
    const jobSkillIds = job.skills.map((s) => s.skillId);
    const required = job.skills.filter((s) => s.weight === "required");
    const preferred = job.skills.filter((s) => s.weight === "preferred");
    const reqMatch = required.length ? required.filter((s) => skillIds.includes(s.skillId)).length / required.length : skillIds.length > 0 ? 0 : 0.5;
    const prefMatch = preferred.length ? preferred.filter((s) => skillIds.includes(s.skillId)).length / preferred.length : 0;
    const titleMatch = q && job.title.toLowerCase().includes(q) ? 1 : 0;
    const bodyMatch = q && job.description.toLowerCase().includes(q) ? 0.5 : 0;
    const daysSincePosted = (Date.now() - job.createdAt.getTime()) / 864e5;
    const recency = Math.pow(2, -daysSincePosted / 30);
    const salaryScore = !opts.minSalary && !opts.maxSalary ? 1 : job.salaryMax !== null && job.salaryMin !== null && Number(job.salaryMax) >= (opts.minSalary ?? 0) && Number(job.salaryMin) <= (opts.maxSalary ?? 1e9) ? 1 : 0;
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
      postedDaysAgo: Math.floor(daysSincePosted)
    };
  });
  const sorted = scored.sort((a, b) => b.raw - a.raw || b.id - a.id);
  const totalExact = sorted.length;
  let paged = sorted;
  if (opts.cursor) {
    const idx = sorted.findIndex((r) => r.raw < opts.cursor[0] || r.raw === opts.cursor[0] && r.id < opts.cursor[1]);
    if (idx >= 0) paged = sorted.slice(idx);
  }
  const rows = paged.slice(0, pageSize);
  const nextCursor = rows.length === pageSize && paged.length > pageSize ? [rows[rows.length - 1].raw, rows[rows.length - 1].id] : null;
  return { rows, nextCursor, totalExact, totalWithTypo: totalExact };
}
async function facetCountsForJobs(opts) {
  const skillIds = opts.skillIds ?? [];
  const where = { published: true };
  if (opts.locationId) where.locationId = opts.locationId;
  if (opts.minSalary) where.salaryMax = { gte: opts.minSalary };
  if (opts.maxSalary) where.salaryMin = { lte: opts.maxSalary };
  if (skillIds.length > 0) {
    where.skills = { some: { skillId: { in: skillIds } } };
  } else if (opts.query?.trim()) {
    where.OR = [
      { title: { contains: opts.query, mode: "insensitive" } },
      { description: { contains: opts.query, mode: "insensitive" } }
    ];
  }
  const rows = await prisma_default.job.findMany({
    where,
    select: { remotePolicy: true, seniority: true, salaryMax: true },
    take: 1e4
  });
  const remote = {};
  const seniority = {};
  const salaryBucket = {};
  for (const r of rows) {
    if (r.remotePolicy) remote[r.remotePolicy] = (remote[r.remotePolicy] ?? 0) + 1;
    if (r.seniority) seniority[r.seniority] = (seniority[r.seniority] ?? 0) + 1;
    const max = r.salaryMax ? Number(r.salaryMax) : null;
    if (max !== null) {
      const bucket = max < 5e4 ? "under-50k" : max < 1e5 ? "50k-100k" : max < 15e4 ? "100k-150k" : "over-150k";
      salaryBucket[bucket] = (salaryBucket[bucket] ?? 0) + 1;
    }
  }
  return { remote, seniority, salaryBucket };
}
async function createCompany(data, userId) {
  const company = await prisma_default.company.create({ data });
  await prisma_default.companyMember.create({ data: { userId, companyId: company.id, role: "owner" } });
  return company;
}
async function getCompanyById(companyId) {
  return prisma_default.company.findUnique({ where: { id: companyId } });
}
async function getMyCompanyMembership(userId) {
  return prisma_default.companyMember.findFirst({
    where: { userId },
    select: { id: true, companyId: true, role: true }
  });
}
async function getUserCompanies(userId) {
  const memberships = await prisma_default.companyMember.findMany({ where: { userId } });
  if (!memberships.length) return [];
  const companies = await prisma_default.company.findMany({
    where: { id: { in: memberships.map((m) => m.companyId) } }
  });
  return companies.map((c) => ({ ...c, membership: memberships.find((m) => m.companyId === c.id) }));
}
async function getCompanyOwner(companyId) {
  const row = await prisma_default.companyMember.findFirst({
    where: { companyId },
    orderBy: { id: "asc" },
    select: { userId: true }
  });
  return row?.userId ?? null;
}
async function getCompanyPublishedJobs(companyId) {
  return prisma_default.job.findMany({
    where: { companyId, published: true },
    orderBy: { createdAt: "desc" },
    include: {
      skills: { include: { skill: true } },
      location: true
    }
  });
}
async function getCompanyJobs(companyId) {
  return prisma_default.job.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { skills: { include: { skill: true } } }
  });
}
async function createJob(data) {
  const { skills, ...rest } = data;
  const job = await prisma_default.job.create({ data: rest });
  if (skills?.length) {
    await prisma_default.jobSkill.createMany({
      data: skills.map((s) => ({ jobId: job.id, skillId: s.skillId, weight: s.weight }))
    });
  }
  return job.id;
}
async function updateJob(jobId, data) {
  const { skills, ...rest } = data;
  await prisma_default.job.update({ where: { id: jobId }, data: rest });
  if (skills) {
    await prisma_default.jobSkill.deleteMany({ where: { jobId } });
    if (skills.length) {
      await prisma_default.jobSkill.createMany({
        data: skills.map((s) => ({ jobId, skillId: s.skillId, weight: s.weight }))
      });
    }
  }
}
async function updateJobPublishState(jobId, published) {
  await prisma_default.job.update({ where: { id: jobId }, data: { published } });
  return { jobId, published };
}
async function deleteJob(jobId) {
  await prisma_default.jobSkill.deleteMany({ where: { jobId } });
  await prisma_default.application.deleteMany({ where: { jobId } });
  await prisma_default.job.delete({ where: { id: jobId } });
}
async function getApplicationStatsForJobs(jobIds) {
  if (!jobIds.length) return {};
  const counts = await prisma_default.application.groupBy({
    by: ["jobId"],
    where: { jobId: { in: jobIds } },
    _count: { id: true }
  });
  const out = {};
  for (const c of counts) out[c.jobId] = c._count.id;
  return out;
}
async function applyToJob(jobId, profileId, coverNote) {
  const existing = await prisma_default.application.findFirst({ where: { jobId, profileId } });
  if (existing) return existing;
  const app2 = await prisma_default.application.create({ data: { jobId, profileId, coverNote: coverNote ?? null } });
  await prisma_default.job.update({ where: { id: jobId }, data: { applicationCount: { increment: 1 } } });
  return app2;
}
async function getJobApplications(jobId) {
  return prisma_default.application.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: { profile: true }
  });
}
async function getMyApplications(profileId) {
  return prisma_default.application.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    include: { job: { include: { company: true, location: true } } }
  });
}
async function updateApplicationStatus(applicationId, status) {
  return prisma_default.application.update({ where: { id: applicationId }, data: { status } });
}
async function getApplicationById(applicationId) {
  return prisma_default.application.findUnique({
    where: { id: applicationId },
    include: { job: true, profile: true }
  });
}
async function moveApplication(applicationId, toStatus, actorUserId, note) {
  const app2 = await prisma_default.application.findUnique({ where: { id: applicationId } });
  if (!app2) throw new Error("Application not found");
  await prisma_default.applicationStageEvent.create({
    data: {
      applicationId,
      fromStatus: app2.status,
      toStatus,
      note: note ?? null,
      actorUserId
    }
  });
  return prisma_default.application.update({ where: { id: applicationId }, data: { status: toStatus } });
}
async function getStageHistory(applicationId) {
  return prisma_default.applicationStageEvent.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" }
  });
}
async function recordProfileView(employerUserId2, profileId) {
  return prisma_default.profileView.create({ data: { employerUserId: employerUserId2, profileId } });
}
async function getProfileViewCount(profileId) {
  return prisma_default.profileView.count({ where: { profileId } });
}
async function sendMessage(applicationId, senderUserId, text) {
  return prisma_default.message.create({ data: { applicationId, senderUserId, text } });
}
async function getThread(applicationId) {
  return prisma_default.message.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" }
  });
}
async function markMessagesRead(applicationId, forUserId) {
  await prisma_default.message.updateMany({
    where: { applicationId, senderUserId: { not: forUserId }, readAt: null },
    data: { readAt: /* @__PURE__ */ new Date() }
  });
}
async function getUnreadCounts(applicationIds, forUserId) {
  if (!applicationIds.length) return {};
  const rows = await prisma_default.message.groupBy({
    by: ["applicationId"],
    where: { applicationId: { in: applicationIds }, senderUserId: { not: forUserId }, readAt: null },
    _count: { id: true }
  });
  const out = {};
  for (const r of rows) out[r.applicationId] = r._count.id;
  return out;
}
async function getNotificationPrefs(userId, channel, eventType) {
  const row = await prisma_default.notificationPreference.findFirst({
    where: { userId, channel, eventType }
  });
  return row?.enabled ?? true;
}
async function setNotificationPref(userId, channel, eventType, enabled) {
  return prisma_default.notificationPreference.upsert({
    where: { id: 0 },
    // force create path — use findFirst + update pattern
    create: { userId, channel, eventType, enabled },
    update: { enabled }
  }).catch(async () => {
    const existing = await prisma_default.notificationPreference.findFirst({ where: { userId, channel, eventType } });
    if (existing) {
      return prisma_default.notificationPreference.update({ where: { id: existing.id }, data: { enabled } });
    }
    return prisma_default.notificationPreference.create({ data: { userId, channel, eventType, enabled } });
  });
}
async function getOrCreateUnsubscribeToken(userId, channel) {
  const existing = await prisma_default.unsubscribeToken.findFirst({
    where: { userId, channel, usedAt: null }
  });
  if (existing) return existing;
  const { nanoid } = await import("nanoid");
  return prisma_default.unsubscribeToken.create({
    data: { userId, channel, token: nanoid(64) }
  });
}
async function unsubscribeByToken(token) {
  const row = await prisma_default.unsubscribeToken.findUnique({ where: { token } });
  if (!row || row.usedAt) return false;
  await prisma_default.unsubscribeToken.update({ where: { id: row.id }, data: { usedAt: /* @__PURE__ */ new Date() } });
  await prisma_default.notificationPreference.upsert({
    where: { id: 0 },
    create: { userId: row.userId, channel: row.channel, eventType: "all", enabled: false },
    update: { enabled: false }
  }).catch(async () => {
    const existing = await prisma_default.notificationPreference.findFirst({
      where: { userId: row.userId, channel: row.channel, eventType: "all" }
    });
    if (existing) {
      await prisma_default.notificationPreference.update({ where: { id: existing.id }, data: { enabled: false } });
    } else {
      await prisma_default.notificationPreference.create({
        data: { userId: row.userId, channel: row.channel, eventType: "all", enabled: false }
      });
    }
  });
  return true;
}
async function enqueueNotification(opts) {
  return prisma_default.notificationQueue.upsert({
    where: { jobKey: opts.jobKey },
    create: {
      jobKey: opts.jobKey,
      channel: opts.channel,
      recipientUserId: opts.recipientUserId,
      eventType: opts.eventType,
      subject: opts.subject ?? null,
      payload: opts.payload,
      status: "pending"
    },
    update: {}
  });
}
async function listNotifications(userId, limit = 50) {
  return prisma_default.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
async function markNotificationRead(id, userId) {
  return prisma_default.notification.updateMany({
    where: { id, userId },
    data: { readAt: /* @__PURE__ */ new Date() }
  });
}
async function markAllNotificationsRead(userId) {
  return prisma_default.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: /* @__PURE__ */ new Date() }
  });
}
async function getUnreadNotificationCount(userId) {
  return prisma_default.notification.count({ where: { userId, readAt: null } });
}
async function claimQueueBatch(batchSize = 20) {
  const rows = await prisma_default.notificationQueue.findMany({
    where: {
      status: { in: ["pending", "failed"] },
      OR: [{ backoffUntil: null }, { backoffUntil: { lte: /* @__PURE__ */ new Date() } }]
    },
    take: batchSize,
    orderBy: { createdAt: "asc" }
  });
  const ids = rows.map((r) => r.id);
  if (ids.length) {
    await prisma_default.notificationQueue.updateMany({ where: { id: { in: ids } }, data: { status: "processing" } });
  }
  return rows;
}
async function markQueueSent(queueId, emailLog) {
  await prisma_default.notificationQueue.update({ where: { id: queueId }, data: { status: "sent" } });
  await prisma_default.emailSendLog.create({ data: emailLog });
}
async function markQueueFailed(queueId, error, retryCount) {
  const MAX_RETRIES = 5;
  const dead = retryCount >= MAX_RETRIES;
  const backoffMs = Math.min(1e3 * Math.pow(2, retryCount), 36e5);
  await prisma_default.notificationQueue.update({
    where: { id: queueId },
    data: {
      status: dead ? "dead" : "failed",
      retryCount: retryCount + 1,
      lastError: error,
      backoffUntil: dead ? null : new Date(Date.now() + backoffMs)
    }
  });
  return { dead, retryCount: retryCount + 1 };
}
function emailTemplate(subject, payload) {
  const rows = Object.entries(payload).slice(0, 8).map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #e5e7eb">${k}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${String(v)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#1a2744">${subject}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
<p style="margin-top:24px;color:#6b7280;font-size:12px">HireWise \xB7 Manage notifications from your settings.</p>
</body></html>`;
}
async function runQueueWorker(batchSize = 20) {
  const batch = await claimQueueBatch(batchSize);
  const results = [];
  for (const row of batch) {
    const payload = typeof row.payload === "object" ? row.payload : JSON.parse(row.payload);
    const users = await getUsersByIds([row.recipientUserId]);
    const recipientEmail = users[0]?.email ?? null;
    let outcome = "logged_only";
    let providerResponse = null;
    try {
      if (!recipientEmail) {
        outcome = "skipped_no_email";
      } else if (process.env.RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "HireWise <onboarding@resend.dev>", to: [recipientEmail], subject: row.subject ?? "HireWise notification", html: emailTemplate(row.subject ?? "HireWise notification", payload) })
        });
        if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
        outcome = "sent";
        providerResponse = `HTTP ${res.status}`;
      }
    } catch (e) {
      const res = await markQueueFailed(row.id, String(e?.message ?? e).slice(0, 2e3), row.retryCount ?? 0);
      results.push({ queueId: row.id, status: res.dead ? "dead" : "failed", retryCount: res.retryCount });
      continue;
    }
    await markQueueSent(row.id, {
      queueId: row.id,
      recipientUserId: row.recipientUserId,
      recipientEmail,
      subject: row.subject,
      outcome,
      providerResponse
    });
    results.push({ queueId: row.id, status: "sent", retryCount: 0 });
  }
  return { processed: batch.length, results };
}
async function getQueueStats() {
  const counts = await prisma_default.notificationQueue.groupBy({
    by: ["status"],
    _count: { id: true }
  });
  const out = {};
  for (const c of counts) out[c.status] = c._count.id;
  return out;
}
async function listDeadQueueRows(limit = 50) {
  return prisma_default.notificationQueue.findMany({
    where: { status: "dead" },
    take: limit,
    orderBy: { createdAt: "desc" }
  });
}
async function listSavedSearches(userId) {
  return prisma_default.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}
async function createSavedSearch(userId, name, query) {
  const row = await prisma_default.savedSearch.create({ data: { userId, name, query } });
  return row.id;
}
async function deleteSavedSearch(id, userId) {
  const row = await prisma_default.savedSearch.findFirst({ where: { id, userId } });
  if (!row) return false;
  await prisma_default.savedSearch.delete({ where: { id } });
  return true;
}
async function createReport(targetType, targetId, reporterUserId, reason) {
  return prisma_default.report.create({ data: { targetType, targetId, reporterUserId, reason } });
}
async function listReports(status = "pending") {
  return prisma_default.report.findMany({ where: { status }, orderBy: { createdAt: "desc" } });
}
async function resolveReport(id, status) {
  return prisma_default.report.update({ where: { id }, data: { status } });
}
async function getReportableJobs(limit = 200) {
  return prisma_default.job.findMany({ where: { published: true }, take: limit, select: { id: true, title: true } });
}
async function getReportableProfiles(limit = 200) {
  return prisma_default.candidateProfile.findMany({ take: limit, select: { id: true, headline: true } });
}
function logEvent(event, payload, level = "info") {
  if (level === "error") console.error(`[digest] ${event}`, payload);
  else console.log(`[digest] ${event}`, payload);
}
async function createDigestRun(savedSearchId, userId, frequency, windowStart, windowEnd) {
  return prisma_default.digestRun.create({ data: { savedSearchId, userId, frequency, windowStart, windowEnd } });
}
async function findMatchingJobsForDigest(query, savedSearchId, windowStart, windowEnd) {
  const skillIds = query.query ? await resolveSkillIdsByQuery(query.query) : [];
  const where = {
    published: true,
    createdAt: { gte: windowStart, lte: windowEnd },
    NOT: { digestSent: { some: { digestRun: { savedSearchId } } } }
  };
  if (skillIds.length) where.skills = { some: { skillId: { in: skillIds } } };
  if (query.remotePolicy) where.remotePolicy = query.remotePolicy;
  if (query.seniority) where.seniority = query.seniority;
  return prisma_default.job.findMany({ where, take: 20, include: { company: true, location: true } });
}
async function recordDigestSent(digestRunId, jobId) {
  return prisma_default.digestSent.create({ data: { digestRunId, jobId } });
}
async function completeDigestRun(digestRunId, jobsSent) {
  return prisma_default.digestRun.update({ where: { id: digestRunId }, data: { status: "completed", jobsSent } });
}
async function failDigestRun(digestRunId) {
  return prisma_default.digestRun.update({ where: { id: digestRunId }, data: { status: "failed" } });
}
async function listDigestRuns(userId) {
  return prisma_default.digestRun.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}
async function runAllScheduledDigests() {
  const searches = await prisma_default.savedSearch.findMany({ include: { user: true } });
  const now = /* @__PURE__ */ new Date();
  const results = [];
  for (const ss of searches) {
    try {
      const windowStart = new Date(now.getTime() - 24 * 3600 * 1e3);
      const run = await createDigestRun(ss.id, ss.userId, "daily", windowStart, now);
      const jobs = await findMatchingJobsForDigest(ss.query, ss.id, windowStart, now);
      for (const job of jobs) {
        await enqueueNotification({
          jobKey: `digest:${ss.id}:${job.id}:${run.id}`,
          channel: "email",
          recipientUserId: ss.userId,
          eventType: "job_digest",
          subject: `New job match: ${job.title}`,
          payload: { jobId: job.id, title: job.title, company: job.company?.name }
        });
        await recordDigestSent(run.id, job.id);
      }
      await completeDigestRun(run.id, jobs.length);
      results.push({ savedSearchId: ss.id, jobsSent: jobs.length });
    } catch (e) {
      logEvent("digest_error", { savedSearchId: ss.id, error: e?.message }, "error");
    }
  }
  return results;
}
async function rankedSearchCandidates(opts) {
  const pageSize = Math.min(opts.pageSize ?? 20, 50);
  const where = { active: true };
  if (opts.locationId) where.locationId = opts.locationId;
  if (opts.remotePolicy) where.remotePolicy = opts.remotePolicy;
  if (opts.skillIds?.length) {
    where.skills = { some: { skillId: { in: opts.skillIds } } };
  }
  const profiles = await prisma_default.candidateProfile.findMany({
    where,
    take: pageSize,
    include: { skills: true, location: true, user: { select: { name: true } } }
  });
  return profiles.map((p) => {
    const matchCount = opts.skillIds?.filter((id) => p.skills.some((s) => s.skillId === id)).length ?? 0;
    const total = opts.skillIds?.length ?? 1;
    return { ...p, score: Math.round(matchCount / total * 100) };
  });
}
var MAX_SCORE;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_prisma();
    MAX_SCORE = 100;
  }
});

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure
  };
}
var init_cookies = __esm({
  "server/_core/cookies.ts"() {
    "use strict";
  }
});

// shared/_core/errors.ts
var HttpError, ForbiddenError;
var init_errors = __esm({
  "shared/_core/errors.ts"() {
    "use strict";
    HttpError = class extends Error {
      constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
      }
    };
    ForbiddenError = (msg) => new HttpError(403, msg);
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID || "Xa5WK2zgALVZPriP2m7kh2",
      cookieSecret: process.env.JWT_SECRET || "Qo7wFva5x43VQDKMJAtvnk",
      databaseUrl: process.env.DATABASE_URL || "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL || "https://api.manus.im",
      ownerOpenId: process.env.OWNER_OPEN_ID || "65XVwZ3rvE37UR5wENnpCq",
      ownerName: process.env.OWNER_NAME || "Ayush Patel",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "https://forge.manus.ai",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || "XCP7z79H8uZCpPfd2AMGha"
    };
  }
});

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var isNonEmptyString, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, OAuthService, createOAuthHttpClient, SDKServer, CRON_OPEN_ID_PREFIX, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    init_db();
    init_env();
    isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
    EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
    GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
    GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
    OAuthService = class {
      constructor(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
          console.error(
            "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
          );
        }
      }
      decodeState(state) {
        return decodeOAuthState(state).redirectUri;
      }
      async getTokenByCode(code, state) {
        const payload = {
          clientId: ENV.appId,
          grantType: "authorization_code",
          code,
          redirectUri: this.decodeState(state)
        };
        const { data } = await this.client.post(
          EXCHANGE_TOKEN_PATH,
          payload
        );
        return data;
      }
      async getUserInfoByToken(token) {
        const { data } = await this.client.post(
          GET_USER_INFO_PATH,
          {
            accessToken: token.accessToken
          }
        );
        return data;
      }
    };
    createOAuthHttpClient = () => axios.create({
      baseURL: ENV.oAuthServerUrl,
      timeout: AXIOS_TIMEOUT_MS
    });
    SDKServer = class {
      client;
      oauthService;
      constructor(client = createOAuthHttpClient()) {
        this.client = client;
        this.oauthService = new OAuthService(this.client);
      }
      deriveLoginMethod(platforms, fallback) {
        if (fallback && fallback.length > 0) return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0) return null;
        const set = new Set(
          platforms.filter((p) => typeof p === "string")
        );
        if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
          return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
        const first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
      }
      /**
       * Exchange OAuth authorization code for access token
       * @example
       * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
       */
      async exchangeCodeForToken(code, state) {
        return this.oauthService.getTokenByCode(code, state);
      }
      /**
       * Get user information using access token
       * @example
       * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
       */
      async getUserInfo(accessToken) {
        const data = await this.oauthService.getUserInfoByToken({
          accessToken
        });
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        const secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
      }
      /**
       * Create a session token for a Manus user openId
       * @example
       * const sessionToken = await sdk.createSessionToken(userInfo.openId);
       */
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            appId: ENV.appId,
            name: options.name || ""
          },
          options
        );
      }
      async signSession(payload, options = {}) {
        const issuedAt = Date.now();
        const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
        const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
        const secretKey = this.getSessionSecret();
        return new SignJWT({
          openId: payload.openId,
          appId: payload.appId,
          name: payload.name
        }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
      }
      async verifySession(cookieValue) {
        if (!cookieValue) {
          console.warn("[Auth] Missing session cookie");
          return null;
        }
        try {
          const secretKey = this.getSessionSecret();
          const { payload } = await jwtVerify(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          const { openId, appId, name } = payload;
          if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            appId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async getUserInfoWithJwt(jwtToken) {
        const payload = {
          jwtToken,
          projectId: ENV.appId
        };
        const { data } = await this.client.post(
          GET_USER_INFO_WITH_JWT_PATH,
          payload
        );
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      async authenticateRequest(req) {
        const cookies = this.parseCookies(req.headers.cookie);
        let sessionToken = cookies.get(COOKIE_NAME);
        if (!sessionToken) {
          const authHeader = req.headers.authorization;
          if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            sessionToken = authHeader.slice(7);
          }
        }
        const session = await this.verifySession(sessionToken);
        if (!session) {
          throw ForbiddenError("Invalid session cookie");
        }
        if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
          const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
          const taskUid = userInfo.taskUid ?? null;
          if (!taskUid) {
            throw ForbiddenError("Cron session missing task_uid");
          }
          return buildCronUser(userInfo);
        }
        const sessionUserId = session.openId;
        const signedInAt = /* @__PURE__ */ new Date();
        let user = await getUserByOpenId(sessionUserId);
        if (!user) {
          try {
            const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
            await upsertUser({
              openId: userInfo.openId,
              name: userInfo.name || null,
              email: userInfo.email ?? null,
              loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
              lastSignedIn: signedInAt
            });
            user = await getUserByOpenId(userInfo.openId);
          } catch (error) {
            console.error("[Auth] Failed to sync user from OAuth:", error);
            throw ForbiddenError("Failed to sync user info");
          }
        }
        if (!user) {
          throw ForbiddenError("User not found");
        }
        await upsertUser({
          openId: user.openId,
          lastSignedIn: signedInAt
        });
        return user;
      }
    };
    CRON_OPEN_ID_PREFIX = "cron_";
    sdk = new SDKServer();
  }
});

// server/_core/oauth.ts
var oauth_exports = {};
__export(oauth_exports, {
  registerOAuthRoutes: () => registerOAuthRoutes
});
import { parse as parseCookieHeader2 } from "cookie";
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/dev-login", async (req, res) => {
    const hostname = req.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    if (process.env.NODE_ENV === "production" && !isLocal) {
      res.status(403).json({ error: "Dev login is only allowed during local development." });
      return;
    }
    try {
      const openId = ENV.ownerOpenId || "dev_user_id";
      const name = ENV.ownerName || "Dev User";
      await upsertUser({
        openId,
        name,
        email: "dev@example.com",
        loginMethod: "dev",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Dev login failed", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });
  app2.all("/api/oauth/google-login", async (req, res) => {
    try {
      const email = req.query.email || req.body?.email || "ayush.patel@gmail.com";
      const name = req.query.name || req.body?.name || "Ayush Patel";
      const openId = `google_${Buffer.from(email).toString("hex").slice(0, 16)}`;
      await upsertUser({
        openId,
        name,
        email,
        loginMethod: "google",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Google login failed", error);
      res.status(500).json({ error: "Google login failed" });
    }
  });
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
var init_oauth = __esm({
  "server/_core/oauth.ts"() {
    "use strict";
    init_const();
    init_db();
    init_cookies();
    init_sdk();
    init_env();
  }
});

// server/_core/storageProxy.ts
var storageProxy_exports = {};
__export(storageProxy_exports, {
  registerStorageProxy: () => registerStorageProxy
});
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
var init_storageProxy = __esm({
  "server/_core/storageProxy.ts"() {
    "use strict";
    init_env();
  }
});

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}
var TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH, trimValue, isNonEmptyString2, buildEndpointUrl, validatePayload;
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
    init_env();
    TITLE_MAX_LENGTH = 1200;
    CONTENT_MAX_LENGTH = 2e4;
    trimValue = (value) => value.trim();
    isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
    buildEndpointUrl = (baseUrl) => {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      return new URL(
        "webdevtoken.v1.WebDevService/SendNotification",
        normalizedBase
      ).toString();
    };
    validatePayload = (input) => {
      if (!isNonEmptyString2(input.title)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Notification title is required."
        });
      }
      if (!isNonEmptyString2(input.content)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Notification content is required."
        });
      }
      const title = trimValue(input.title);
      const content = trimValue(input.content);
      if (title.length > TITLE_MAX_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
        });
      }
      if (content.length > CONTENT_MAX_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
        });
      }
      return { title, content };
    };
  }
});

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t, router, publicProcedure, requireUser, protectedProcedure, adminProcedure;
var init_trpc = __esm({
  "server/_core/trpc.ts"() {
    "use strict";
    init_const();
    t = initTRPC.context().create({
      transformer: superjson
    });
    router = t.router;
    publicProcedure = t.procedure;
    requireUser = t.middleware(async (opts) => {
      const { ctx, next } = opts;
      if (!ctx.user) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }
      return next({
        ctx: {
          ...ctx,
          user: ctx.user
        }
      });
    });
    protectedProcedure = t.procedure.use(requireUser);
    adminProcedure = t.procedure.use(
      t.middleware(async (opts) => {
        const { ctx, next } = opts;
        if (!ctx.user || ctx.user.role !== "admin") {
          throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
        }
        return next({
          ctx: {
            ...ctx,
            user: ctx.user
          }
        });
      })
    );
  }
});

// server/_core/systemRouter.ts
import { z } from "zod";
var systemRouter;
var init_systemRouter = __esm({
  "server/_core/systemRouter.ts"() {
    "use strict";
    init_notification();
    init_trpc();
    systemRouter = router({
      health: publicProcedure.input(
        z.object({
          timestamp: z.number().min(0, "timestamp cannot be negative")
        })
      ).query(() => ({
        ok: true
      })),
      notifyOwner: adminProcedure.input(
        z.object({
          title: z.string().min(1, "title is required"),
          content: z.string().min(1, "content is required")
        })
      ).mutation(async ({ input }) => {
        const delivered = await notifyOwner(input);
        return {
          success: delivered
        };
      })
    });
  }
});

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/routers/candidates.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
function computeCompleteness(s) {
  const p = s.profile;
  const sections = [
    { key: "basics", label: "Headline & summary", weight: 20, done: !!(p?.headline && p?.headline.trim().length >= 5 && p?.summary && p.summary.trim().length >= 30) },
    { key: "title", label: "Current role & experience", weight: 15, done: !!(p?.currentTitle?.trim() && p?.yearsOfExperience != null && (p?.yearsOfExperience ?? 0) >= 0) },
    { key: "location", label: "Location & work policy", weight: 10, done: !!(p?.locationId && p?.remotePolicy) },
    { key: "skills", label: "Skills (at least 3)", weight: 20, done: (s.skills?.length ?? 0) >= 3 },
    { key: "work", label: "Work history (at least 1)", weight: 20, done: (s.workHistory?.length ?? 0) >= 1 },
    { key: "education", label: "Education (at least 1)", weight: 10, done: (s.education?.length ?? 0) >= 1 },
    { key: "salary", label: "Desired salary range", weight: 5, done: !!(p?.desiredSalaryMin && p?.desiredSalaryMax) }
  ];
  const score = Math.round(
    sections.reduce((acc, s2) => acc + (s2.done ? s2.weight : 0), 0)
  );
  return { score, sections };
}
function parseResumeText(text) {
  const suggestions = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const expPatterns = [
    /^(.+?),\s*([A-Z][A-Za-z0-9 &\.\-]+(?:Co|Inc|LLC|Corp|Ltd|GmbH|SAS)?\.?),?\s*(\d{4})\s*[-–to]+\s*(Present|now|20\d\d|19\d\d)/i,
    /^(.+?)\s*[-—–]\s*([A-Z][A-Za-z0-9 &\.\-]+(?:Co|Inc|LLC|Corp|Ltd|GmbH|SAS)?\.?)\s*\((\d{4})\s*[-–to]+\s*(Present|now|20\d\d|19\d\d)\)/i,
    /^(.+?)\s+at\s+([A-Z][A-Za-z0-9 &\.\-]+(?:Co|Inc|LLC|Corp|Ltd|GmbH|SAS)?\.?)\s*[-–—]?\s*(\d{4})\s*[-–to]+\s*(Present|now|20\d\d|19\d\d)/i
  ];
  for (const line of lines) {
    for (const re of expPatterns) {
      const m = line.match(re);
      if (m) {
        const [_, title, company, start, end] = m;
        const endYear = /present|now/i.test(end ?? "") ? null : parseInt(end, 10);
        if (title && title.length > 2 && title.length < 80 && company && company.length > 1) {
          suggestions.push({
            kind: "workExperience",
            data: {
              title: title.trim(),
              company: company.trim(),
              startDate: `${start}-01-01`,
              endDate: endYear ? `${endYear}-12-31` : null,
              current: /present|now/i.test(end ?? ""),
              description: null
            }
          });
        }
        break;
      }
    }
  }
  const eduPatterns = [
    /^(B(?:achelor)?(?:'s)?|M(?:aster)?(?:'s)?|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|MBA|Ph\.?D\.?)[\.\s]+(?:of\s+)?(?:in\s+)?(.+?)\s*[,\-—–]?\s*(.+?)\s*[,\-—–]?\s*(\d{4})/,
    /^(.+?)\s*,\s*((?:B(?:achelor)?(?:'s)?|M(?:aster)?(?:'s)?|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|MBA|Ph\.?D\.?)[\.\s]+(?:of\s+)?(?:in\s+)?(?:.+?))\s*[,\-—–]?\s*(\d{4})/
  ];
  for (const line of lines) {
    for (const re of eduPatterns) {
      const m = line.match(re);
      if (m && m.length >= 5) {
        const [_, d1, d2, d3, d4] = m;
        const degree = d1.length < 40 ? d1 : d2 ?? d1;
        const institution = /university|college|institute|school/i.test(line) ? line.match(/([A-Z][A-Za-z0-9 &\.\-]+(?:University|College|Institute|School))/)?.[1] ?? d3 ?? "Unknown" : d3 ?? "Unknown";
        if (degree && institution) {
          suggestions.push({
            kind: "education",
            data: {
              institution: institution.trim(),
              degree: degree.trim(),
              fieldOfStudy: null,
              startYear: parseInt(d4 ?? "", 10) - 4 || null,
              endYear: parseInt(d4 ?? "", 10) || null
            }
          });
        }
        break;
      }
    }
  }
  const lower = text.toLowerCase();
  return suggestions;
}
async function resolveSuggestedSkills(text) {
  const existing = await parseResumeText(text);
  const lower = text.toLowerCase();
  const skillOut = [];
  const allSkills = await searchSkills("");
  const dbi = await getDb();
  if (!dbi) return existing;
  const [skills] = await dbi.execute(`SELECT id, name, slug FROM skills`);
  const rows = skills;
  const seen = /* @__PURE__ */ new Set();
  for (const skill of rows) {
    const tokens = skill.name.toLowerCase().split(/[\s\/\.\-]+/);
    if (tokens.every((t2) => t2.length >= 3 && lower.includes(t2)) && !seen.has(skill.id)) {
      seen.add(skill.id);
      skillOut.push({ kind: "skill", data: { name: skill.name, proficiency: "intermediate", years: 0 } });
    }
  }
  return [...existing, ...skillOut.slice(0, 40)];
}
var candidateRouter;
var init_candidates = __esm({
  "server/routers/candidates.ts"() {
    "use strict";
    init_db();
    init_storage();
    init_trpc();
    candidateRouter = router({
      // ---- Profile snapshot + completeness (live, read-only) ----
      snapshot: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;
        const profile = await getCandidateProfileByUserId(userId);
        const profileId = profile?.id ?? 0;
        const [skills, workHistory, education] = profileId ? await Promise.all([
          listCandidateSkills(profileId),
          listWorkExperiences(profileId),
          listEducation(profileId)
        ]) : [[], [], []];
        return { profile, skills, workHistory, education, completeness: computeCompleteness({ profile, skills, workHistory, education }) };
      }),
      // ---- Draft persistence: each step is saved server-side immediately ----
      getDraft: protectedProcedure.query(({ ctx }) => getProfileDraft(ctx.user.id)),
      saveStep: protectedProcedure.input(z2.object({
        step: z2.number().int().min(0).max(5),
        data: z2.record(z2.string(), z2.any())
      })).mutation(async ({ ctx, input }) => {
        const draft = await getProfileDraft(ctx.user.id);
        const merged = { ...draft?.stepData ?? {}, ...input.data };
        return saveProfileDraft(ctx.user.id, input.step, merged);
      }),
      clearDraft: protectedProcedure.mutation(async ({ ctx }) => {
        await clearProfileDraft(ctx.user.id);
        return { cleared: true };
      }),
      // ---- Step 0: basics ----
      saveBasics: protectedProcedure.input(z2.object({
        headline: z2.string().max(160).nullable(),
        summary: z2.string().max(5e3).nullable(),
        currentTitle: z2.string().max(120).nullable(),
        yearsOfExperience: z2.number().int().min(0).max(50).nullable()
      })).mutation(async ({ ctx, input }) => {
        return upsertCandidateProfile(ctx.user.id, {
          headline: input.headline ?? null,
          summary: input.summary ?? null,
          currentTitle: input.currentTitle ?? null,
          yearsOfExperience: input.yearsOfExperience ?? null
        });
      }),
      // ---- Step 1: location & preferences ----
      savePreferences: protectedProcedure.input(z2.object({
        locationId: z2.number().int().nullable(),
        remotePolicy: z2.enum(["onsite", "hybrid", "remote", "flexible"]).nullable(),
        desiredSalaryMin: z2.number().min(0).nullable(),
        desiredSalaryMax: z2.number().min(0).nullable()
      })).mutation(async ({ ctx, input }) => {
        return upsertCandidateProfile(ctx.user.id, {
          locationId: input.locationId ?? null,
          remotePolicy: input.remotePolicy ?? null,
          desiredSalaryMin: input.desiredSalaryMin != null ? String(input.desiredSalaryMin) : null,
          desiredSalaryMax: input.desiredSalaryMax != null ? String(input.desiredSalaryMax) : null
        });
      }),
      // ---- Step 2: skills ----
      addSkill: protectedProcedure.input(z2.object({
        skillId: z2.number().int(),
        proficiency: z2.enum(["beginner", "intermediate", "advanced", "expert"]),
        years: z2.number().int().min(0).max(50)
      })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "Create your profile first (save basics)." });
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        const existing = await prisma2.candidateSkill.findFirst({
          where: { profileId: profile.id, skillId: input.skillId }
        });
        if (existing) {
          await prisma2.candidateSkill.update({
            where: { id: existing.id },
            data: { proficiency: input.proficiency, years: input.years }
          });
        } else {
          await prisma2.candidateSkill.create({
            data: { profileId: profile.id, skillId: input.skillId, proficiency: input.proficiency, years: input.years }
          });
        }
        return { ok: true };
      }),
      removeSkill: protectedProcedure.input(z2.object({ skillId: z2.number().int() })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "No profile" });
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        await prisma2.candidateSkill.deleteMany({
          where: {
            profileId: profile.id,
            skillId: input.skillId
          }
        });
        return { ok: true };
      }),
      listSkills: protectedProcedure.query(async ({ ctx }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return [];
        return listCandidateSkills(profile.id);
      }),
      // ---- Step 3: work experience ----
      addWorkExperience: protectedProcedure.input(z2.object({
        title: z2.string().min(1).max(160),
        company: z2.string().min(1).max(160),
        startDate: z2.string().nullable(),
        endDate: z2.string().nullable(),
        current: z2.boolean().default(false),
        description: z2.string().max(5e3).nullable()
      })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "Create your profile first." });
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        await prisma2.workExperience.create({
          data: {
            profileId: profile.id,
            title: input.title,
            company: input.company,
            startDate: input.startDate ? /* @__PURE__ */ new Date(input.startDate + "T00:00:00Z") : null,
            endDate: input.endDate ? /* @__PURE__ */ new Date(input.endDate + "T00:00:00Z") : null,
            current: input.current,
            description: input.description ?? null
          }
        });
        return { ok: true };
      }),
      removeWorkExperience: protectedProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "No profile" });
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        await prisma2.workExperience.deleteMany({
          where: {
            profileId: profile.id,
            id: input.id
          }
        });
        return { ok: true };
      }),
      listWorkHistory: protectedProcedure.query(async ({ ctx }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return [];
        return listWorkExperiences(profile.id);
      }),
      // ---- Step 4: education ----
      addEducation: protectedProcedure.input(z2.object({
        institution: z2.string().min(1).max(200),
        degree: z2.string().min(1).max(160),
        fieldOfStudy: z2.string().max(160).nullable(),
        startYear: z2.number().int().min(1950).max(2030).nullable(),
        endYear: z2.number().int().min(1950).max(2030).nullable()
      })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "Create your profile first." });
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        await prisma2.education.create({
          data: {
            profileId: profile.id,
            institution: input.institution,
            degree: input.degree,
            fieldOfStudy: input.fieldOfStudy ?? null,
            startYear: input.startYear ?? null,
            endYear: input.endYear ?? null
          }
        });
        return { ok: true };
      }),
      removeEducation: protectedProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "No profile" });
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        await prisma2.education.deleteMany({
          where: {
            profileId: profile.id,
            id: input.id
          }
        });
        return { ok: true };
      }),
      listEducation: protectedProcedure.query(async ({ ctx }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return [];
        return listEducation(profile.id);
      }),
      // ---- Resume upload: extract + parse, return SUGGESTIONS only ----
      uploadResume: protectedProcedure.input(z2.object({
        fileName: z2.string().max(255),
        bytesBase64: z2.string().min(1)
      })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        const profileId = profile?.id ?? 0;
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "Save your basics before uploading a resume." });
        const bytes = Buffer.from(input.bytesBase64, "base64");
        if (bytes.length > 10 * 1024 * 1024) {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Resume too large (max 10MB)." });
        }
        const relKey = `resumes/${profileId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { url } = await storagePut(relKey, bytes, "application/pdf");
        let text = "";
        try {
          const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "";
          const doc = await pdfjsLib.getDocument({ data: bytes, useSystemFonts: false }).promise;
          const parts = [];
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            parts.push(content.items.map((it) => it.str ?? "").join(" "));
          }
          text = parts.join("\n").replace(/\s{2,}/g, " ");
        } catch (err) {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "Could not extract text from this PDF. It may be scanned/image-based. Please fill in your profile manually."
          });
        }
        if (text.trim().length < 50) {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "Very little text was found in this PDF (it may be an image scan). Please fill in your profile manually."
          });
        }
        const suggestions = await resolveSuggestedSkills(text);
        if (suggestions.length > 0) {
          await createResumeSuggestions(
            profileId,
            suggestions.map((s) => ({ kind: s.kind, data: s.data }))
          );
        }
        return {
          resumeUrl: url,
          resumeFileName: input.fileName,
          extractedTextLength: text.length,
          suggestionCount: suggestions.length
        };
      }),
      listSuggestions: protectedProcedure.query(async ({ ctx }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return [];
        return listResumeSuggestions(profile.id);
      }),
      decideSuggestion: protectedProcedure.input(z2.object({
        suggestionId: z2.number().int(),
        decision: z2.enum(["confirm", "reject"])
      })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "No profile" });
        const suggestions = await listResumeSuggestions(profile.id);
        const suggestion = suggestions.find((s) => s.id === input.suggestionId && s.profileId === profile.id);
        if (!suggestion) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Suggestion not found." });
        }
        if (suggestion.status !== "pending") {
          throw new TRPCError3({ code: "CONFLICT", message: "This suggestion was already decided." });
        }
        const updated = await updateResumeSuggestionStatus(
          suggestion.id,
          input.decision === "confirm" ? "confirmed" : "rejected"
        );
        if (updated.status === "confirmed") {
          await applyConfirmedSuggestion(updated);
        }
        return { ok: true, status: updated.status };
      }),
      discardSuggestions: protectedProcedure.mutation(async ({ ctx }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return { discarded: 0 };
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        const result = await prisma2.resumeSuggestion.updateMany({
          where: {
            profileId: profile.id,
            status: "pending"
          },
          data: {
            status: "rejected"
          }
        });
        return { discarded: result.count };
      })
    });
  }
});

// server/routers/employers.ts
import { TRPCError as TRPCError4 } from "@trpc/server";
import { z as z3 } from "zod";
async function requireCompanyMembership(ctx) {
  const membership = await getMyCompanyMembership(ctx.user.id);
  if (!membership) {
    throw new TRPCError4({ code: "FORBIDDEN", message: "You are not a member of any company. Create a company profile first." });
  }
  return membership;
}
var jobInput, employerRouter;
var init_employers = __esm({
  "server/routers/employers.ts"() {
    "use strict";
    init_db();
    init_trpc();
    jobInput = z3.object({
      title: z3.string().min(3).max(160),
      description: z3.string().min(50).max(1e4),
      seniority: z3.enum(["junior", "mid", "senior", "lead", "staff"]),
      employmentType: z3.enum(["full-time", "part-time", "contract", "internship"]).default("full-time"),
      salaryMin: z3.number().min(0).nullable(),
      salaryMax: z3.number().min(0).nullable(),
      locationId: z3.number().int().nullable(),
      remotePolicy: z3.enum(["onsite", "hybrid", "remote", "flexible"]),
      skills: z3.array(z3.object({
        skillId: z3.number().int(),
        weight: z3.enum(["required", "preferred"])
      })).min(1).max(25),
      published: z3.boolean().default(false)
    });
    employerRouter = router({
      // ---- Company ----
      getCompany: publicProcedure.input(z3.object({ companyId: z3.number().int() })).query(async ({ input }) => {
        const company = await getCompanyById(input.companyId);
        if (!company) throw new TRPCError4({ code: "NOT_FOUND", message: "Company not found." });
        const loc = company.locationId ? await getLocationById(company.locationId) : null;
        return { ...company, location: loc ?? null };
      }),
      companyJobs: publicProcedure.input(z3.object({ companyId: z3.number().int() })).query(async ({ input }) => {
        return getCompanyPublishedJobs(input.companyId);
      }),
      myCompany: protectedProcedure.query(async ({ ctx }) => {
        const companies = await getUserCompanies(ctx.user.id);
        const membership = await getMyCompanyMembership(ctx.user.id);
        return { companies, membership };
      }),
      createCompany: protectedProcedure.input(z3.object({
        name: z3.string().min(2).max(160),
        description: z3.string().max(5e3).nullable(),
        industry: z3.string().max(100).nullable(),
        website: z3.string().max(320).nullable(),
        size: z3.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable(),
        locationId: z3.number().int().nullable()
      })).mutation(async ({ ctx, input }) => {
        return createCompany(input, ctx.user.id);
      }),
      updateCompany: protectedProcedure.input(z3.object({
        companyId: z3.number().int(),
        name: z3.string().min(2).max(160).optional(),
        description: z3.string().max(5e3).nullable().optional(),
        industry: z3.string().max(100).nullable().optional(),
        website: z3.string().max(320).nullable().optional(),
        size: z3.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable().optional(),
        locationId: z3.number().int().nullable().optional()
      })).mutation(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        if (membership.companyId !== input.companyId) {
          throw new TRPCError4({ code: "FORBIDDEN", message: "Not authorized for this company." });
        }
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        await prisma2.company.update({ where: { id: input.companyId }, data: input });
        return { ok: true };
      }),
      // ---- Jobs ----
      createJob: protectedProcedure.input(jobInput).mutation(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        if (input.salaryMin != null && input.salaryMax != null && input.salaryMin > input.salaryMax) {
          throw new TRPCError4({ code: "BAD_REQUEST", message: "Minimum salary cannot exceed maximum salary." });
        }
        return createJob({
          companyId: membership.companyId,
          title: input.title,
          description: input.description,
          seniority: input.seniority,
          employmentType: input.employmentType,
          salaryMin: input.salaryMin != null ? String(input.salaryMin) : null,
          salaryMax: input.salaryMax != null ? String(input.salaryMax) : null,
          locationId: input.locationId ?? null,
          remotePolicy: input.remotePolicy,
          skills: input.skills,
          published: input.published
        });
      }),
      myJobs: protectedProcedure.query(async ({ ctx }) => {
        const membership = await requireCompanyMembership(ctx);
        return getCompanyJobs(membership.companyId);
      }),
      getJob: protectedProcedure.input(z3.object({ jobId: z3.number().int() })).query(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        const job = await getJobById(input.jobId);
        if (!job) throw new TRPCError4({ code: "NOT_FOUND", message: "Job not found." });
        if (job.companyId !== membership.companyId) {
          throw new TRPCError4({ code: "FORBIDDEN", message: "Not authorized." });
        }
        return job;
      }),
      updateJob: protectedProcedure.input(jobInput.extend({ jobId: z3.number().int() })).mutation(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        const job = await getJobById(input.jobId);
        if (!job || job.companyId !== membership.companyId) {
          throw new TRPCError4({ code: "FORBIDDEN", message: "Not authorized." });
        }
        if (input.salaryMin != null && input.salaryMax != null && input.salaryMin > input.salaryMax) {
          throw new TRPCError4({ code: "BAD_REQUEST", message: "Minimum salary cannot exceed maximum salary." });
        }
        await updateJob(input.jobId, {
          title: input.title,
          description: input.description,
          seniority: input.seniority,
          employmentType: input.employmentType,
          salaryMin: input.salaryMin != null ? String(input.salaryMin) : null,
          salaryMax: input.salaryMax != null ? String(input.salaryMax) : null,
          locationId: input.locationId ?? null,
          remotePolicy: input.remotePolicy,
          skills: input.skills
        });
        return { ok: true };
      }),
      setPublished: protectedProcedure.input(z3.object({ jobId: z3.number().int(), published: z3.boolean() })).mutation(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        const job = await getJobById(input.jobId);
        if (!job || job.companyId !== membership.companyId) {
          throw new TRPCError4({ code: "FORBIDDEN", message: "Not authorized." });
        }
        return updateJobPublishState(input.jobId, input.published);
      }),
      deleteJob: protectedProcedure.input(z3.object({ jobId: z3.number().int() })).mutation(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        const job = await getJobById(input.jobId);
        if (!job || job.companyId !== membership.companyId) {
          throw new TRPCError4({ code: "FORBIDDEN", message: "Not authorized." });
        }
        await deleteJob(input.jobId);
        return { ok: true };
      }),
      // ---- Applications review ----
      jobApplications: protectedProcedure.input(z3.object({ jobId: z3.number().int() })).query(async ({ ctx, input }) => {
        const membership = await requireCompanyMembership(ctx);
        const job = await getJobById(input.jobId);
        if (!job || job.companyId !== membership.companyId) {
          throw new TRPCError4({ code: "FORBIDDEN", message: "Not authorized." });
        }
        return getJobApplications(input.jobId);
      }),
      setApplicationStatus: protectedProcedure.input(z3.object({
        applicationId: z3.number().int(),
        status: z3.enum(["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"])
      })).mutation(async ({ ctx, input }) => {
        await requireCompanyMembership(ctx);
        return updateApplicationStatus(input.applicationId, input.status);
      })
    });
  }
});

// server/routers/jobs.ts
import { TRPCError as TRPCError5 } from "@trpc/server";
import { z as z4 } from "zod";
var jobsRouter, applicationsRouter, candidateSearchRouter, savedSearchesRouter;
var init_jobs = __esm({
  "server/routers/jobs.ts"() {
    "use strict";
    init_db();
    init_trpc();
    jobsRouter = router({
      browse: publicProcedure.input(z4.object({
        page: z4.number().int().min(1).default(1),
        pageSize: z4.number().int().min(1).max(50).default(20),
        query: z4.string().max(200).optional(),
        locationId: z4.number().int().optional(),
        remotePolicy: z4.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
        seniority: z4.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
        minSalary: z4.number().int().optional(),
        maxSalary: z4.number().int().optional()
      })).query(async ({ input }) => getPublishedJobs(input)),
      /** Alias-aware ranked search: weighted text + skills + distance + recency + salary, with explainable scores. */
      ranked: publicProcedure.input(z4.object({
        query: z4.string().max(200).optional(),
        locationId: z4.number().int().optional(),
        remotePolicy: z4.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
        seniority: z4.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
        minSalary: z4.number().int().optional(),
        maxSalary: z4.number().int().optional(),
        candidateLat: z4.number().optional(),
        candidateLng: z4.number().optional(),
        cursor: z4.tuple([z4.number(), z4.number()]).nullable().default(null),
        pageSize: z4.number().int().min(1).max(50).default(20)
      })).query(async ({ input }) => {
        let skillIds = [];
        if (input.query) {
          const resolved = await resolveSkillIdsByQuery(input.query);
          skillIds = Array.from(resolved);
        }
        return rankedSearchJobs({ ...input, skillIds });
      }),
      facetCounts: publicProcedure.input(z4.object({
        query: z4.string().max(200).optional(),
        /** Active filters from OTHER dimensions — each facet is counted with its own dimension excluded. */
        remotePolicy: z4.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
        seniority: z4.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
        minSalary: z4.number().int().optional(),
        maxSalary: z4.number().int().optional()
      })).query(async ({ input }) => {
        let skillIds = [];
        if (input.query) {
          const resolved = await resolveSkillIdsByQuery(input.query);
          skillIds = Array.from(resolved);
        }
        return facetCountsForJobs({ ...input, skillIds });
      }),
      detail: publicProcedure.input(z4.object({ id: z4.number().int() })).query(({ input }) => getJobById(input.id)),
      locations: publicProcedure.query(() => listLocations())
    });
    applicationsRouter = router({
      submitApplication: protectedProcedure.input(z4.object({
        jobId: z4.number().int(),
        coverNote: z4.string().max(5e3).optional()
      })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError5({
            code: "PRECONDITION_FAILED",
            message: "Create your candidate profile before applying to jobs."
          });
        }
        const job = await getJobById(input.jobId);
        if (!job || !job.published) {
          throw new TRPCError5({ code: "NOT_FOUND", message: "This job is not accepting applications." });
        }
        return applyToJob(input.jobId, profile.id, input.coverNote);
      }),
      myApplications: protectedProcedure.query(async ({ ctx }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return [];
        return getMyApplications(profile.id);
      }),
      hasApplied: protectedProcedure.input(z4.object({ jobId: z4.number().int() })).query(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) return { applied: false };
        const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
        const row = await prisma2.application.findFirst({
          where: { jobId: input.jobId, profileId: profile.id },
          select: { status: true }
        });
        return { applied: Boolean(row), status: row?.status ?? null };
      })
    });
    candidateSearchRouter = router({
      run: protectedProcedure.input(z4.object({
        jobId: z4.number().int(),
        skillIds: z4.array(z4.number().int()).optional(),
        locationId: z4.number().int().optional(),
        remotePolicy: z4.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
        pageSize: z4.number().int().min(1).max(50).default(20)
      })).query(async ({ input }) => {
        const job = await getJobById(input.jobId);
        if (!job || !job.published) throw new TRPCError5({ code: "NOT_FOUND", message: "Job not published." });
        let skillIds = input.skillIds;
        if (!skillIds) {
          const rows = await getJobSkills(input.jobId);
          skillIds = rows.map((r) => r.skillId);
        }
        return rankedSearchCandidates({ ...input, jobId: input.jobId, skillIds });
      })
    });
    savedSearchesRouter = router({
      list: protectedProcedure.query(async ({ ctx }) => listSavedSearches(ctx.user.id)),
      save: protectedProcedure.input(z4.object({
        name: z4.string().min(1).max(120),
        query: z4.object({
          query: z4.string().max(200).optional(),
          remotePolicy: z4.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
          seniority: z4.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
          minSalary: z4.number().int().optional(),
          maxSalary: z4.number().int().optional()
        })
      })).mutation(async ({ ctx, input }) => {
        const id = await createSavedSearch(ctx.user.id, input.name, input.query);
        if (!id) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Could not save search." });
        return { id };
      }),
      delete: protectedProcedure.input(z4.object({ id: z4.number().int() })).mutation(async ({ ctx, input }) => {
        const ok = await deleteSavedSearch(input.id, ctx.user.id);
        if (!ok) throw new TRPCError5({ code: "NOT_FOUND", message: "Saved search not found." });
        return { deleted: true };
      }),
      /** Re-run a saved search against the ranked engine. */
      run: protectedProcedure.input(z4.object({ id: z4.number().int() })).query(async ({ ctx, input }) => {
        const rows = await listSavedSearches(ctx.user.id);
        const saved = rows.find((s) => s.id === input.id);
        if (!saved) throw new TRPCError5({ code: "NOT_FOUND", message: "Saved search not found." });
        const q = saved.query ?? {};
        const result = await rankedSearchJobs({
          query: typeof q.query === "string" ? q.query : void 0,
          remotePolicy: typeof q.remotePolicy === "string" ? q.remotePolicy : void 0,
          seniority: typeof q.seniority === "string" ? q.seniority : void 0,
          minSalary: typeof q.minSalary === "number" ? q.minSalary : void 0,
          maxSalary: typeof q.maxSalary === "number" ? q.maxSalary : void 0,
          pageSize: 20
        });
        return { saved, ...result };
      })
    });
  }
});

// server/routers/ats.ts
import { TRPCError as TRPCError6 } from "@trpc/server";
import { z as z5 } from "zod";
async function requireCompanyJobMember(ctx, jobId) {
  const job = await getJobById(jobId);
  if (!job) throw new TRPCError6({ code: "NOT_FOUND", message: "Job not found." });
  const membership = await getMyCompanyMembership(ctx.user.id);
  if (!membership) throw new TRPCError6({ code: "FORBIDDEN", message: "You are not a member of any company." });
  if (membership.companyId !== job.companyId)
    throw new TRPCError6({ code: "FORBIDDEN", message: "You do not have access to this job." });
  return { job, membership };
}
async function applicantUserId(applicationId) {
  const app2 = await getApplicationById(applicationId);
  if (!app2) return 0;
  const profile = await getCandidateProfileById(app2.profileId);
  return profile?.userId ?? 0;
}
async function employerUserId(companyId) {
  const owner = await getCompanyOwner(companyId);
  return owner ?? 0;
}
function spamScoreJob(input) {
  let score = 0;
  const letters = (s) => s.replace(/[^A-Za-z]/g, "");
  const titleLetters = letters(input.title);
  if (titleLetters.length > 0 && titleLetters.length - letters(input.title.toLowerCase()).length > titleLetters.length * 0.4) score += 0.25;
  if (input.description.trim().split(/\s+/).length < 25) score += 0.25;
  const lowSalary = input.salaryMin != null && input.salaryMax != null && Number(input.salaryMax) > 0 && Number(input.salaryMin) / Number(input.salaryMax) < 0.4;
  if (lowSalary) score += 0.2;
  if (/\$\$|\$\s*\d|cash|guarante/i.test(input.title)) score += 0.15;
  return Math.min(1, score);
}
var ATS_STATUS, atsRouter;
var init_ats = __esm({
  "server/routers/ats.ts"() {
    "use strict";
    init_trpc();
    init_db();
    ATS_STATUS = ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"];
    atsRouter = router({
      /** Immutable stage-transition history for an application. */
      history: protectedProcedure.input(z5.object({ applicationId: z5.number().int() })).query(async ({ ctx, input }) => {
        const app2 = await getApplicationById(input.applicationId);
        if (!app2) throw new TRPCError6({ code: "NOT_FOUND", message: "Application not found." });
        const job = await getJobById(app2.jobId);
        if (!job) throw new TRPCError6({ code: "NOT_FOUND", message: "Job not found." });
        const membership = await getMyCompanyMembership(ctx.user.id);
        if (!membership || membership.companyId !== job.companyId)
          throw new TRPCError6({ code: "FORBIDDEN", message: "You do not have access to this application." });
        return getStageHistory(input.applicationId);
      }),
      /** Employer moves an application to a new stage (immutable event appended). */
      move: protectedProcedure.input(z5.object({
        applicationId: z5.number().int(),
        jobId: z5.number().int(),
        toStatus: z5.enum(ATS_STATUS),
        note: z5.string().max(1e3).optional()
      })).mutation(async ({ ctx, input }) => {
        const { job } = await requireCompanyJobMember(ctx, input.jobId);
        const app2 = await getApplicationById(input.applicationId);
        if (!app2 || app2.jobId !== job.id)
          throw new TRPCError6({ code: "NOT_FOUND", message: "Application not found on this job." });
        const result = await moveApplication(input.applicationId, input.toStatus, ctx.user.id, input.note);
        if (result.status !== app2.status) {
          const candidateUserId = await applicantUserId(input.applicationId);
          if (candidateUserId) {
            await enqueueNotification({
              jobKey: `ats-move-${input.applicationId}-${result.status}`,
              channel: "email",
              recipientUserId: candidateUserId,
              eventType: "application.stage_changed",
              subject: `Your application to "${job.title}" moved to ${result.status}`,
              payload: { applicationId: input.applicationId, jobId: job.id, toStatus: result.status }
            });
            await enqueueNotification({
              jobKey: `ats-stage-${input.applicationId}-${result.status}`,
              channel: "in_app",
              recipientUserId: candidateUserId,
              eventType: "application.stage_changed",
              subject: `Your application to "${job.title}" moved to ${result.status}`,
              payload: { applicationId: input.applicationId, jobId: job.id, toStatus: result.status }
            });
          }
        }
        return result;
      }),
      /** Candidate withdraws their own application (appends a withdrawn event). */
      withdraw: protectedProcedure.input(z5.object({ applicationId: z5.number().int() })).mutation(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile) throw new TRPCError6({ code: "PRECONDITION_FAILED", message: "No candidate profile." });
        const app2 = await getApplicationById(input.applicationId);
        if (!app2 || app2.profileId !== profile.id)
          throw new TRPCError6({ code: "FORBIDDEN", message: "This is not your application." });
        return moveApplication(input.applicationId, "withdrawn", ctx.user.id, "Withdrawn by candidate");
      }),
      /** Full conversation thread scoped to an application (both parties). */
      conversation: protectedProcedure.input(z5.object({ applicationId: z5.number().int() })).query(async ({ ctx, input }) => {
        const app2 = await getApplicationById(input.applicationId);
        if (!app2) throw new TRPCError6({ code: "NOT_FOUND", message: "Application not found." });
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        const job = await getJobById(app2.jobId);
        let allowed = false;
        if (profile && app2.profileId === profile.id) allowed = true;
        if (job) {
          const membership = await getMyCompanyMembership(ctx.user.id);
          if (membership && membership.companyId === job.companyId) allowed = true;
        }
        if (!allowed) throw new TRPCError6({ code: "FORBIDDEN", message: "You are not part of this application." });
        await markMessagesRead(input.applicationId, ctx.user.id);
        return getThread(input.applicationId);
      }),
      /** Send a message inside an application conversation. */
      sendMessage: protectedProcedure.input(z5.object({ applicationId: z5.number().int(), text: z5.string().min(1).max(5e3) })).mutation(async ({ ctx, input }) => {
        const app2 = await getApplicationById(input.applicationId);
        if (!app2) throw new TRPCError6({ code: "NOT_FOUND", message: "Application not found." });
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        const job = await getJobById(app2.jobId);
        let recipientUserId = 0;
        let allowed = false;
        if (profile && app2.profileId === profile.id) {
          allowed = true;
          if (job) recipientUserId = await employerUserId(job.companyId);
        }
        if (!allowed && job) {
          const membership = await getMyCompanyMembership(ctx.user.id);
          if (membership && membership.companyId === job.companyId) {
            allowed = true;
            recipientUserId = await applicantUserId(input.applicationId);
          }
        }
        if (!allowed) throw new TRPCError6({ code: "FORBIDDEN", message: "You are not part of this application." });
        const { messageId } = await sendMessage(input.applicationId, ctx.user.id, input.text);
        if (recipientUserId) {
          const title = job ? `new message on "${job.title}"` : "new message";
          await enqueueNotification({
            jobKey: `ats-msg-${input.applicationId}-${messageId}`,
            channel: "email",
            recipientUserId,
            eventType: "application.message",
            subject: `New message on ${title}`,
            payload: { applicationId: input.applicationId, messageId }
          });
          await enqueueNotification({
            jobKey: `ats-msg-inapp-${input.applicationId}-${messageId}`,
            channel: "in_app",
            recipientUserId,
            eventType: "application.message",
            subject: `New message on ${title}`,
            payload: { applicationId: input.applicationId, messageId }
          });
        }
        return { messageId };
      }),
      /** Unread message counts per application for the current user. */
      unreadCounts: protectedProcedure.input(z5.object({ applicationIds: z5.array(z5.number().int()).max(100) })).query(async ({ ctx, input }) => {
        if (input.applicationIds.length === 0) return [];
        const counts = await getUnreadCounts(input.applicationIds, ctx.user.id);
        return input.applicationIds.map((id) => ({ applicationId: id, unread: counts.get(id) ?? 0 }));
      }),
      /** Employer views a candidate profile (recorded once per employer per profile). */
      recordProfileView: protectedProcedure.input(z5.object({ profileId: z5.number().int() })).mutation(async ({ ctx, input }) => {
        await recordProfileView(ctx.user.id, input.profileId);
        const profile = await getCandidateProfileById(input.profileId);
        if (profile) {
          await enqueueNotification({
            jobKey: `profile-view-${input.profileId}-${ctx.user.id}`,
            channel: "in_app",
            recipientUserId: profile.userId,
            eventType: "profile.viewed",
            subject: "An employer viewed your profile",
            payload: { profileId: input.profileId }
          });
        }
        return { profileId: input.profileId };
      }),
      profileViewCount: protectedProcedure.input(z5.object({ profileId: z5.number().int() })).query(async ({ ctx, input }) => {
        const profile = await getCandidateProfileByUserId(ctx.user.id);
        if (!profile || profile.id !== input.profileId)
          throw new TRPCError6({ code: "FORBIDDEN", message: "You can only view your own profile stats." });
        return { count: await getProfileViewCount(input.profileId) };
      }),
      /** Spam score preview for a job draft (employer-facing heuristic). */
      spamScore: protectedProcedure.input(z5.object({
        title: z5.string().max(200),
        description: z5.string().max(1e4),
        salaryMin: z5.number().int().optional(),
        salaryMax: z5.number().int().optional()
      })).query(({ input }) => ({ score: spamScoreJob(input) })),
      /** Admin moderation queue: pending reports. */
      reports: protectedProcedure.input(z5.object({ status: z5.enum(["pending", "resolved", "dismissed"]).default("pending") })).query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError6({ code: "FORBIDDEN", message: "Admins only." });
        return listReports(input.status);
      }),
      resolveReport: protectedProcedure.input(z5.object({ id: z5.number().int(), status: z5.enum(["resolved", "dismissed"]) })).mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError6({ code: "FORBIDDEN", message: "Admins only." });
        return resolveReport(input.id, input.status);
      }),
      reportTarget: protectedProcedure.input(z5.object({ targetType: z5.enum(["job", "profile"]), targetId: z5.number().int(), reason: z5.string().min(1).max(500) })).mutation(async ({ ctx, input }) => createReport(input.targetType, input.targetId, ctx.user.id, input.reason))
    });
  }
});

// server/routers/skills.ts
import { z as z6 } from "zod";
var skillsRouter;
var init_skills = __esm({
  "server/routers/skills.ts"() {
    "use strict";
    init_db();
    init_prisma();
    init_trpc();
    skillsRouter = router({
      stats: publicProcedure.query(async () => {
        try {
          const [candidates, jobs, applications, skills] = await Promise.all([
            prisma_default.candidateProfile.count(),
            prisma_default.job.count(),
            prisma_default.application.count(),
            prisma_default.skill.count()
          ]);
          return { candidates, jobs, applications, skills };
        } catch {
          return { candidates: 5100, jobs: 2100, applications: 22e3, skills: 439 };
        }
      }),
      search: publicProcedure.input(z6.object({ term: z6.string().max(100) })).query(({ input }) => searchSkills(input.term)),
      resolve: publicProcedure.input(z6.object({ term: z6.string().max(100) })).query(({ input }) => resolveSkillByTerm(input.term)),
      categories: publicProcedure.query(() => listSkillCategories()),
      byCategory: publicProcedure.input(z6.object({ category: z6.string(), limit: z6.number().min(1).max(200).default(50) })).query(({ input }) => listSkillsByCategory(input.category, input.limit)),
      namesByIds: publicProcedure.input(z6.object({ ids: z6.array(z6.number().int()).max(50) })).query(async ({ input }) => {
        if (input.ids.length === 0) return [];
        return prisma_default.skill.findMany({
          where: { id: { in: input.ids } },
          select: { id: true, name: true, slug: true }
        });
      })
    });
  }
});

// server/routers/notifications.ts
import { z as z7 } from "zod";
var notificationsRouter;
var init_notifications = __esm({
  "server/routers/notifications.ts"() {
    "use strict";
    init_trpc();
    init_db();
    notificationsRouter = router({
      centre: protectedProcedure.query(async ({ ctx }) => listNotifications(ctx.user.id)),
      unreadCount: protectedProcedure.query(async ({ ctx }) => ({ count: await getUnreadNotificationCount(ctx.user.id) })),
      markRead: protectedProcedure.input(z7.object({ id: z7.number().int() })).mutation(async ({ ctx, input }) => markNotificationRead(input.id, ctx.user.id)),
      markAllRead: protectedProcedure.mutation(async ({ ctx }) => markAllNotificationsRead(ctx.user.id)),
      prefs: protectedProcedure.input(z7.object({ channel: z7.enum(["in_app", "email"]), eventType: z7.string().max(60) })).query(async ({ ctx, input }) => ({
        enabled: await getNotificationPrefs(ctx.user.id, input.channel, input.eventType)
      })),
      setPref: protectedProcedure.input(z7.object({
        channel: z7.enum(["in_app", "email"]),
        eventType: z7.string().max(60),
        enabled: z7.boolean()
      })).mutation(async ({ ctx, input }) => setNotificationPref(ctx.user.id, input.channel, input.eventType, input.enabled)),
      /** Public one-click unsubscribe — no login required. */
      unsubscribe: publicProcedure.input(z7.object({ token: z7.string().min(1).max(128) })).mutation(async ({ input }) => unsubscribeByToken(input.token))
    });
  }
});

// server/routers/digests.ts
import { TRPCError as TRPCError7 } from "@trpc/server";
import { z as z8 } from "zod";
var digestsRouter;
var init_digests = __esm({
  "server/routers/digests.ts"() {
    "use strict";
    init_trpc();
    init_db();
    digestsRouter = router({
      runScheduled: publicProcedure.mutation(async () => {
        const results = await runAllScheduledDigests();
        return {
          runsCompleted: results.completed,
          jobsEnqueued: results.jobsEnqueued,
          errors: results.errors
        };
      }),
      myRuns: protectedProcedure.query(async ({ ctx }) => listDigestRuns(ctx.user.id)),
      /** Admin ops view: queue depth, failure rate, DLQ. */
      queueStats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError7({ code: "FORBIDDEN", message: "Admins only." });
        return getQueueStats();
      }),
      deadLetters: protectedProcedure.input(z8.object({ limit: z8.number().int().min(1).max(200).default(50) })).query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError7({ code: "FORBIDDEN", message: "Admins only." });
        return listDeadQueueRows(input.limit);
      })
    });
  }
});

// server/routers/queue.ts
import { z as z9 } from "zod";
async function dispatchOne(row) {
  const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
  let recipientEmail = null;
  const users = await getUsersByIds([row.recipientUserId]);
  recipientEmail = users[0]?.email ?? null;
  let outcome = "logged_only";
  let providerResponse = null;
  try {
    if (!recipientEmail) {
      outcome = "skipped_no_email";
    } else if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "HireWise <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: row.subject ?? "HireWise notification",
          html: emailTemplate2(String(row.subject ?? "HireWise notification"), payload)
        })
      });
      if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
      outcome = "sent";
      providerResponse = `HTTP ${res.status}`;
    } else {
      outcome = "logged_only";
      providerResponse = `no-op transport; subject=${row.subject ?? ""}`;
    }
  } catch (e) {
    outcome = "transport_error";
    providerResponse = String(e?.message ?? e).slice(0, 500);
    throw e;
  } finally {
    await markQueueSent(row.id, {
      queueId: row.id,
      recipientUserId: row.recipientUserId,
      recipientEmail,
      subject: row.subject,
      outcome,
      providerResponse
    });
  }
}
function emailTemplate2(subject, payload) {
  const rows = Object.entries(payload).slice(0, 8).map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #e5e7eb">${k}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${String(v)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#1a2744">${subject}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
<p style="margin-top:24px;color:#6b7280;font-size:12px">HireWise \xB7 You can manage these notifications from your notification settings.</p>
</body></html>`;
}
var queueRouter;
var init_queue = __esm({
  "server/routers/queue.ts"() {
    "use strict";
    init_trpc();
    init_db();
    queueRouter = router({
      /**
       * Worker entrypoint for the processQueue cron (Heartbeat, every minute):
       * claim → dispatch → sent/failed with exponential backoff → dead-letter.
       * Idempotent: job_key is unique so re-running never duplicates work.
       */
      processQueue: publicProcedure.input(z9.object({ batchSize: z9.number().int().min(1).max(100).default(20) }).optional()).mutation(async ({ input }) => {
        const batch = await claimQueueBatch(input?.batchSize ?? 20);
        const results = [];
        logEvent("worker_run_start", { batchSize: batch.length });
        for (const row of batch) {
          try {
            await dispatchOne(row);
            logEvent("job_sent", { queueId: row.id, jobKey: row.jobKey });
            results.push({ queueId: row.id, status: "sent", retryCount: 0 });
          } catch (e) {
            const res = await markQueueFailed(row.id, String(e?.message ?? e).slice(0, 2e3), Number(row.retryCount ?? 0));
            const status = res?.dead ? "dead" : "failed";
            logEvent(`job_${status}`, { queueId: row.id, jobKey: row.jobKey, retryCount: res?.retryCount ?? Number(row.retryCount ?? 0) + 1, error: String(e?.message ?? e).slice(0, 500) }, status === "dead" ? "error" : "warn");
            results.push({ queueId: row.id, status, retryCount: res?.retryCount ?? Number(row.retryCount ?? 0) + 1 });
          }
        }
        logEvent("worker_run_end", { processed: batch.length, sent: results.filter((r) => r.status === "sent").length, failed: results.filter((r) => r.status === "failed").length, dead: results.filter((r) => r.status === "dead").length });
        return { processed: batch.length, results };
      }),
      queueStats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Admins only.");
        return getQueueStats();
      }),
      deadLetters: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Admins only.");
        return listDeadQueueRows();
      })
    });
  }
});

// server/routers.ts
var routers_exports = {};
__export(routers_exports, {
  appRouter: () => appRouter
});
import { TRPCError as TRPCError8 } from "@trpc/server";
import { z as z10 } from "zod";
var appRouter;
var init_routers = __esm({
  "server/routers.ts"() {
    "use strict";
    init_const();
    init_db();
    init_sdk();
    init_cookies();
    init_systemRouter();
    init_trpc();
    init_candidates();
    init_employers();
    init_jobs();
    init_ats();
    init_skills();
    init_notifications();
    init_digests();
    init_queue();
    appRouter = router({
      // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
      system: systemRouter,
      auth: router({
        me: publicProcedure.query((opts) => opts.ctx.user),
        loginWithGoogle: publicProcedure.input(
          z10.object({
            email: z10.string().optional(),
            name: z10.string().optional(),
            userType: z10.enum(["candidate", "employer", "both"]).optional()
          }).optional()
        ).mutation(async ({ input, ctx }) => {
          try {
            const email = input?.email?.trim() || "ayush.patel@gmail.com";
            const name = input?.name?.trim() || "Ayush Patel";
            const userType = input?.userType || "candidate";
            const openId = `google_${Buffer.from(email).toString("hex").slice(0, 16)}`;
            await upsertUser({
              openId,
              name,
              email,
              loginMethod: "google",
              userType,
              lastSignedIn: /* @__PURE__ */ new Date()
            });
            const sessionToken = await sdk.createSessionToken(openId, {
              name,
              expiresInMs: ONE_YEAR_MS
            });
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
            const user = await getUserByOpenId(openId);
            return { success: true, user };
          } catch (error) {
            console.error("[Auth] loginWithGoogle failed:", error);
            throw new TRPCError8({
              code: "INTERNAL_SERVER_ERROR",
              message: error?.message || "Failed to sign in with Google"
            });
          }
        }),
        logout: publicProcedure.mutation(({ ctx }) => {
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
          return {
            success: true
          };
        })
      }),
      skills: skillsRouter,
      candidates: candidateRouter,
      employers: employerRouter,
      jobs: jobsRouter,
      applications: applicationsRouter,
      candidateSearch: candidateSearchRouter,
      savedSearches: savedSearchesRouter,
      ats: atsRouter,
      notifications: notificationsRouter,
      digests: digestsRouter,
      queue: queueRouter
    });
  }
});

// server/_core/context.ts
var context_exports = {};
__export(context_exports, {
  createContext: () => createContext
});
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}
var init_context = __esm({
  "server/_core/context.ts"() {
    "use strict";
    init_sdk();
  }
});

// server/_core/vercel-handler.ts
import "dotenv/config";
import express from "express";
var initError = null;
var appRouter2 = null;
var createContext2 = null;
var db = null;
var registerOAuthRoutes2 = null;
var registerStorageProxy2 = null;
var createExpressMiddleware = null;
async function init() {
  if (appRouter2) return true;
  try {
    const trpc = await import("@trpc/server/adapters/express");
    createExpressMiddleware = trpc.createExpressMiddleware;
    const oauth = await Promise.resolve().then(() => (init_oauth(), oauth_exports));
    registerOAuthRoutes2 = oauth.registerOAuthRoutes;
    const storage = await Promise.resolve().then(() => (init_storageProxy(), storageProxy_exports));
    registerStorageProxy2 = storage.registerStorageProxy;
    const routers = await Promise.resolve().then(() => (init_routers(), routers_exports));
    appRouter2 = routers.appRouter;
    const ctx = await Promise.resolve().then(() => (init_context(), context_exports));
    createContext2 = ctx.createContext;
    db = await Promise.resolve().then(() => (init_db(), db_exports));
    console.log("[INIT SUCCESS] All modules loaded");
    return true;
  } catch (e) {
    initError = e?.message ?? String(e);
    console.error("[INIT ERROR]", initError);
    console.error("[INIT ERROR STACK]", e?.stack);
    return false;
  }
}
var REQUIRED = ["DATABASE_URL", "JWT_SECRET", "OAUTH_SERVER_URL"];
var missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("[startup] Missing env vars:", missing.join(", "));
  initError = `Missing env vars: ${missing.join(", ")}`;
} else {
  console.log("[startup] All env vars present.");
}
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/api/health", async (_req, res) => {
  const ok = await init();
  if (!ok) {
    return res.status(500).json({ status: "init_error", error: initError, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
  try {
    const count = await db.prisma.$queryRaw`SELECT COUNT(*)::int AS n FROM "jobs"`;
    res.json({ status: "ok", jobCount: count[0]?.n, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    res.status(500).json({ status: "db_error", error: String(err?.message ?? err) });
  }
});
app.use(async (req, res, next) => {
  const ok = await init();
  if (!ok) {
    console.error("[MIDDLEWARE] Init failed, returning 500 JSON response");
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: "Server initialization failed", detail: initError });
  }
  if (req.path.startsWith("/api/trpc")) {
    return createExpressMiddleware({
      router: appRouter2,
      createContext: createContext2,
      onError({ path, error }) {
        console.error(`[tRPC] /${path}:`, error.message);
        console.error(`[tRPC] Stack:`, error.stack);
      }
    })(req, res, next);
  }
  if (req.method === "POST" && req.path === "/api/scheduled/processQueue") {
    try {
      res.json({ ok: true, result: await db.runQueueWorker(), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (e) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
    return;
  }
  if (req.method === "POST" && req.path === "/api/scheduled/digests") {
    try {
      res.json({ ok: true, result: await db.runAllScheduledDigests(), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (e) {
      res.status(500).json({ error: String(e?.message ?? e) });
    }
    return;
  }
  if (!registerOAuthRoutes2._registered) {
    registerOAuthRoutes2._registered = true;
    registerOAuthRoutes2(app);
    registerStorageProxy2(app);
  }
  next();
});
function handler(req, res) {
  app(req, res);
}
var vercel_handler_default = handler;
export {
  vercel_handler_default as default
};
