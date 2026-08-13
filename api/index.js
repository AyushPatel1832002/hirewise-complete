"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/lib/prisma.ts
var import_client, globalForPrisma, prisma, prisma_default;
var init_prisma = __esm({
  "server/lib/prisma.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    globalForPrisma = globalThis;
    prisma = globalForPrisma.prisma ?? new import_client.PrismaClient({
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
  getDb: () => getDb,
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
async function getDb() {
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
  const { skills: skills2, ...rest } = data;
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
  const jobs2 = await prisma_default.job.findMany({
    where,
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      location: { select: { city: true, country: true } },
      skills: { select: { skillId: true, weight: true } }
    }
  });
  const scored = jobs2.map((job) => {
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
  const companies2 = await prisma_default.company.findMany({
    where: { id: { in: memberships.map((m) => m.companyId) } }
  });
  return companies2.map((c) => ({ ...c, membership: memberships.find((m) => m.companyId === c.id) }));
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
  const { skills: skills2, ...rest } = data;
  const job = await prisma_default.job.create({ data: rest });
  if (skills2?.length) {
    await prisma_default.jobSkill.createMany({
      data: skills2.map((s) => ({ jobId: job.id, skillId: s.skillId, weight: s.weight }))
    });
  }
  return job.id;
}
async function updateJob(jobId, data) {
  const { skills: skills2, ...rest } = data;
  await prisma_default.job.update({ where: { id: jobId }, data: rest });
  if (skills2) {
    await prisma_default.jobSkill.deleteMany({ where: { jobId } });
    if (skills2.length) {
      await prisma_default.jobSkill.createMany({
        data: skills2.map((s) => ({ jobId, skillId: s.skillId, weight: s.weight }))
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
async function sendMessage(applicationId, senderUserId, text2) {
  return prisma_default.message.create({ data: { applicationId, senderUserId, text: text2 } });
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
    const users2 = await getUsersByIds([row.recipientUserId]);
    const recipientEmail = users2[0]?.email ?? null;
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
      const jobs2 = await findMatchingJobsForDigest(ss.query, ss.id, windowStart, now);
      for (const job of jobs2) {
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
      await completeDigestRun(run.id, jobs2.length);
      results.push({ savedSearchId: ss.id, jobsSent: jobs2.length });
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

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  applicationStageEvents: () => applicationStageEvents,
  applications: () => applications,
  applicationsJobProfileUniqueIdx: () => applicationsJobProfileUniqueIdx,
  candidateProfiles: () => candidateProfiles,
  candidateSkills: () => candidateSkills,
  companies: () => companies,
  companyMembers: () => companyMembers,
  digestRuns: () => digestRuns,
  digestSent: () => digestSent,
  education: () => education,
  emailSendLog: () => emailSendLog,
  jobSkills: () => jobSkills,
  jobs: () => jobs,
  locations: () => locations,
  messages: () => messages,
  notificationPreferences: () => notificationPreferences,
  notificationQueue: () => notificationQueue,
  notifications: () => notifications,
  profileDrafts: () => profileDrafts,
  profileViews: () => profileViews,
  reports: () => reports,
  resumeSuggestions: () => resumeSuggestions,
  savedSearches: () => savedSearches,
  skillAliases: () => skillAliases,
  skills: () => skills,
  unsubscribeTokens: () => unsubscribeTokens,
  users: () => users,
  workExperiences: () => workExperiences
});
var import_mysql_core, users, candidateProfiles, locations, skills, skillAliases, candidateSkills, workExperiences, education, resumeSuggestions, profileDrafts, companies, companyMembers, jobs, jobSkills, applications, applicationsJobProfileUniqueIdx, applicationStageEvents, profileViews, messages, reports, savedSearches, notificationPreferences, unsubscribeTokens, notifications, notificationQueue, emailSendLog, digestRuns, digestSent;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    import_mysql_core = require("drizzle-orm/mysql-core");
    users = (0, import_mysql_core.mysqlTable)("users", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      openId: (0, import_mysql_core.varchar)("openId", { length: 64 }).notNull().unique(),
      name: (0, import_mysql_core.text)("name"),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }),
      loginMethod: (0, import_mysql_core.varchar)("loginMethod", { length: 64 }),
      role: (0, import_mysql_core.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
      userType: (0, import_mysql_core.mysqlEnum)("userType", ["candidate", "employer", "both"]).default("candidate").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: (0, import_mysql_core.timestamp)("lastSignedIn").defaultNow().notNull()
    });
    candidateProfiles = (0, import_mysql_core.mysqlTable)("candidateProfiles", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull().unique(),
      headline: (0, import_mysql_core.varchar)("headline", { length: 160 }),
      summary: (0, import_mysql_core.text)("summary"),
      currentTitle: (0, import_mysql_core.varchar)("currentTitle", { length: 120 }),
      yearsOfExperience: (0, import_mysql_core.smallint)("yearsOfExperience"),
      locationId: (0, import_mysql_core.int)("locationId"),
      remotePolicy: (0, import_mysql_core.mysqlEnum)("remotePolicy", ["onsite", "hybrid", "remote", "flexible"]),
      desiredSalaryMin: (0, import_mysql_core.decimal)("desiredSalaryMin", { precision: 12, scale: 2 }),
      desiredSalaryMax: (0, import_mysql_core.decimal)("desiredSalaryMax", { precision: 12, scale: 2 }),
      resumeUrl: (0, import_mysql_core.varchar)("resumeUrl", { length: 512 }),
      resumeFileName: (0, import_mysql_core.varchar)("resumeFileName", { length: 255 }),
      active: (0, import_mysql_core.boolean)("active").default(true).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    locations = (0, import_mysql_core.mysqlTable)("locations", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      city: (0, import_mysql_core.varchar)("city", { length: 100 }),
      region: (0, import_mysql_core.varchar)("region", { length: 100 }),
      country: (0, import_mysql_core.varchar)("country", { length: 80 }).notNull(),
      displayName: (0, import_mysql_core.varchar)("displayName", { length: 200 }).notNull(),
      /** Geographic coordinates for geo-distance ranking. Nullable for unknown rows. */
      latitude: (0, import_mysql_core.decimal)("latitude", { precision: 10, scale: 7 }),
      longitude: (0, import_mysql_core.decimal)("longitude", { precision: 10, scale: 7 })
    });
    skills = (0, import_mysql_core.mysqlTable)("skills", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      name: (0, import_mysql_core.varchar)("name", { length: 100 }).notNull().unique(),
      slug: (0, import_mysql_core.varchar)("slug", { length: 120 }).notNull().unique(),
      category: (0, import_mysql_core.varchar)("category", { length: 80 }).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    skillAliases = (0, import_mysql_core.mysqlTable)("skillAliases", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      alias: (0, import_mysql_core.varchar)("alias", { length: 100 }).notNull().unique(),
      skillId: (0, import_mysql_core.int)("skillId").notNull()
    });
    candidateSkills = (0, import_mysql_core.mysqlTable)("candidateSkills", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      profileId: (0, import_mysql_core.int)("profileId").notNull(),
      skillId: (0, import_mysql_core.int)("skillId").notNull(),
      proficiency: (0, import_mysql_core.mysqlEnum)("proficiency", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
      years: (0, import_mysql_core.smallint)("years").default(0).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    workExperiences = (0, import_mysql_core.mysqlTable)("workExperiences", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      profileId: (0, import_mysql_core.int)("profileId").notNull(),
      title: (0, import_mysql_core.varchar)("title", { length: 160 }).notNull(),
      company: (0, import_mysql_core.varchar)("company", { length: 160 }).notNull(),
      startDate: (0, import_mysql_core.date)("startDate"),
      endDate: (0, import_mysql_core.date)("endDate"),
      current: (0, import_mysql_core.boolean)("current").default(false).notNull(),
      description: (0, import_mysql_core.text)("description")
    });
    education = (0, import_mysql_core.mysqlTable)("education", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      profileId: (0, import_mysql_core.int)("profileId").notNull(),
      institution: (0, import_mysql_core.varchar)("institution", { length: 200 }).notNull(),
      degree: (0, import_mysql_core.varchar)("degree", { length: 160 }).notNull(),
      fieldOfStudy: (0, import_mysql_core.varchar)("fieldOfStudy", { length: 160 }),
      startYear: (0, import_mysql_core.smallint)("startYear"),
      endYear: (0, import_mysql_core.smallint)("endYear")
    });
    resumeSuggestions = (0, import_mysql_core.mysqlTable)("resumeSuggestions", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      profileId: (0, import_mysql_core.int)("profileId").notNull(),
      kind: (0, import_mysql_core.mysqlEnum)("kind", ["workExperience", "education", "skill"]).notNull(),
      status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "confirmed", "rejected"]).default("pending").notNull(),
      data: (0, import_mysql_core.json)("data").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    profileDrafts = (0, import_mysql_core.mysqlTable)("profileDrafts", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull().unique(),
      currentStep: (0, import_mysql_core.smallint)("currentStep").default(0).notNull(),
      stepData: (0, import_mysql_core.json)("stepData").notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    companies = (0, import_mysql_core.mysqlTable)("companies", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull().unique(),
      description: (0, import_mysql_core.text)("description"),
      industry: (0, import_mysql_core.varchar)("industry", { length: 100 }),
      website: (0, import_mysql_core.varchar)("website", { length: 320 }),
      size: (0, import_mysql_core.mysqlEnum)("size", ["1-10", "11-50", "51-200", "201-1000", "1000+"]),
      locationId: (0, import_mysql_core.int)("locationId"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    companyMembers = (0, import_mysql_core.mysqlTable)("companyMembers", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      companyId: (0, import_mysql_core.int)("companyId").notNull(),
      role: (0, import_mysql_core.mysqlEnum)("role", ["owner", "member"]).default("member").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    jobs = (0, import_mysql_core.mysqlTable)("jobs", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      companyId: (0, import_mysql_core.int)("companyId").notNull(),
      title: (0, import_mysql_core.varchar)("title", { length: 160 }).notNull(),
      description: (0, import_mysql_core.text)("description").notNull(),
      seniority: (0, import_mysql_core.mysqlEnum)("seniority", ["junior", "mid", "senior", "lead", "staff"]).notNull(),
      employmentType: (0, import_mysql_core.mysqlEnum)("employmentType", ["full-time", "part-time", "contract", "internship"]).default("full-time").notNull(),
      salaryMin: (0, import_mysql_core.decimal)("salaryMin", { precision: 12, scale: 2 }),
      salaryMax: (0, import_mysql_core.decimal)("salaryMax", { precision: 12, scale: 2 }),
      locationId: (0, import_mysql_core.int)("locationId"),
      remotePolicy: (0, import_mysql_core.mysqlEnum)("remotePolicy", ["onsite", "hybrid", "remote", "flexible"]).notNull(),
      published: (0, import_mysql_core.boolean)("published").default(false).notNull(),
      applicationCount: (0, import_mysql_core.int)("applicationCount").default(0).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    jobSkills = (0, import_mysql_core.mysqlTable)("jobSkills", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      jobId: (0, import_mysql_core.int)("jobId").notNull(),
      skillId: (0, import_mysql_core.int)("skillId").notNull(),
      weight: (0, import_mysql_core.mysqlEnum)("weight", ["required", "preferred"]).notNull()
    });
    applications = (0, import_mysql_core.mysqlTable)("applications", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      jobId: (0, import_mysql_core.int)("jobId").notNull(),
      profileId: (0, import_mysql_core.int)("profileId").notNull(),
      /** Status is derived from the latest row in applicationStageEvents; kept as a denormalised cache. */
      status: (0, import_mysql_core.mysqlEnum)("status", ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]).default("applied").notNull(),
      coverNote: (0, import_mysql_core.text)("coverNote"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    applicationsJobProfileUniqueIdx = (0, import_mysql_core.uniqueIndex)("applications_job_profile_uq").on(
      applications.jobId,
      applications.profileId
    );
    applicationStageEvents = (0, import_mysql_core.mysqlTable)("applicationStageEvents", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      applicationId: (0, import_mysql_core.int)("applicationId").notNull(),
      fromStatus: (0, import_mysql_core.mysqlEnum)("fromStatus", ["none", "applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]).default("none").notNull(),
      toStatus: (0, import_mysql_core.mysqlEnum)("toStatus", ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]).notNull(),
      note: (0, import_mysql_core.text)("note"),
      actorUserId: (0, import_mysql_core.int)("actorUserId").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    profileViews = (0, import_mysql_core.mysqlTable)("profileViews", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      employerUserId: (0, import_mysql_core.int)("employerUserId").notNull(),
      profileId: (0, import_mysql_core.int)("profileId").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    messages = (0, import_mysql_core.mysqlTable)("messages", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      applicationId: (0, import_mysql_core.int)("applicationId").notNull(),
      senderUserId: (0, import_mysql_core.int)("senderUserId").notNull(),
      text: (0, import_mysql_core.text)("text").notNull(),
      readAt: (0, import_mysql_core.timestamp)("readAt"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    reports = (0, import_mysql_core.mysqlTable)("reports", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      targetType: (0, import_mysql_core.mysqlEnum)("targetType", ["job", "profile"]).notNull(),
      targetId: (0, import_mysql_core.int)("targetId").notNull(),
      reporterUserId: (0, import_mysql_core.int)("reporterUserId").notNull(),
      reason: (0, import_mysql_core.varchar)("reason", { length: 500 }).notNull(),
      status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "resolved", "dismissed"]).default("pending").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    savedSearches = (0, import_mysql_core.mysqlTable)("savedSearches", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
      query: (0, import_mysql_core.json)("query").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    notificationPreferences = (0, import_mysql_core.mysqlTable)("notificationPreferences", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      channel: (0, import_mysql_core.mysqlEnum)("channel", ["in_app", "email"]).notNull(),
      eventType: (0, import_mysql_core.varchar)("eventType", { length: 60 }).notNull(),
      enabled: (0, import_mysql_core.boolean)("enabled").default(true).notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    unsubscribeTokens = (0, import_mysql_core.mysqlTable)("unsubscribeTokens", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      channel: (0, import_mysql_core.mysqlEnum)("channel", ["in_app", "email"]).notNull(),
      token: (0, import_mysql_core.varchar)("token", { length: 128 }).notNull().unique(),
      usedAt: (0, import_mysql_core.timestamp)("usedAt"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    notifications = (0, import_mysql_core.mysqlTable)("notifications", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      type: (0, import_mysql_core.varchar)("type", { length: 60 }).notNull(),
      payload: (0, import_mysql_core.json)("payload"),
      readAt: (0, import_mysql_core.timestamp)("readAt"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    notificationQueue = (0, import_mysql_core.mysqlTable)("notificationQueue", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      jobKey: (0, import_mysql_core.varchar)("jobKey", { length: 255 }).notNull().unique(),
      channel: (0, import_mysql_core.mysqlEnum)("channel", ["in_app", "email"]).notNull(),
      recipientUserId: (0, import_mysql_core.int)("recipientUserId").notNull(),
      eventType: (0, import_mysql_core.varchar)("eventType", { length: 60 }).notNull(),
      subject: (0, import_mysql_core.varchar)("subject", { length: 255 }),
      payload: (0, import_mysql_core.json)("payload").notNull(),
      status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "processing", "sent", "failed", "dead"]).default("pending").notNull(),
      retryCount: (0, import_mysql_core.int)("retryCount").default(0).notNull(),
      backoffUntil: (0, import_mysql_core.timestamp)("backoffUntil"),
      lastError: (0, import_mysql_core.text)("lastError"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    emailSendLog = (0, import_mysql_core.mysqlTable)("emailSendLog", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      queueId: (0, import_mysql_core.int)("queueId"),
      recipientUserId: (0, import_mysql_core.int)("recipientUserId"),
      recipientEmail: (0, import_mysql_core.varchar)("recipientEmail", { length: 320 }),
      subject: (0, import_mysql_core.varchar)("subject", { length: 255 }),
      outcome: (0, import_mysql_core.mysqlEnum)("outcome", ["sent", "skipped_no_email", "transport_error", "logged_only"]).notNull(),
      providerResponse: (0, import_mysql_core.text)("providerResponse"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    digestRuns = (0, import_mysql_core.mysqlTable)("digestRuns", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      savedSearchId: (0, import_mysql_core.int)("savedSearchId").notNull(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      frequency: (0, import_mysql_core.mysqlEnum)("frequency", ["daily", "weekly"]).notNull(),
      windowStart: (0, import_mysql_core.timestamp)("windowStart").notNull(),
      windowEnd: (0, import_mysql_core.timestamp)("windowEnd").notNull(),
      status: (0, import_mysql_core.mysqlEnum)("status", ["running", "completed", "failed"]).default("running").notNull(),
      jobsSent: (0, import_mysql_core.int)("jobsSent").default(0).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    digestSent = (0, import_mysql_core.mysqlTable)("digestSent", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      digestRunId: (0, import_mysql_core.int)("digestRunId").notNull(),
      jobId: (0, import_mysql_core.int)("jobId").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
  }
});

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => handler
});
module.exports = __toCommonJS(index_exports);
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_express2 = require("@trpc/server/adapters/express");

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
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

// server/_core/oauth.ts
var import_cookie2 = require("cookie");
init_db();

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

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
var import_axios = __toESM(require("axios"), 1);
var import_cookie = require("cookie");
var import_jose = require("jose");
init_db();

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID || "Xa5WK2zgALVZPriP2m7kh2",
  cookieSecret: process.env.JWT_SECRET || "Qo7wFva5x43VQDKMJAtvnk",
  databaseUrl: process.env.DATABASE_URL || 'mysql://3pXYBN7ALdP3R8i.root:BGnF8OX9e1BrMFV0iO77@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/Xa5WK2zgALVZPriP2m7kh2?ssl={"rejectUnauthorized":true}',
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "https://api.manus.im",
  ownerOpenId: process.env.OWNER_OPEN_ID || "65XVwZ3rvE37UR5wENnpCq",
  ownerName: process.env.OWNER_NAME || "Ayush Patel",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "https://forge.manus.ai",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || "XCP7z79H8uZCpPfd2AMGha"
};

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
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
var createOAuthHttpClient = () => import_axios.default.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
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
    const parsed = (0, import_cookie.parse)(cookieHeader);
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
    return new import_jose.SignJWT({
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
      const { payload } = await (0, import_jose.jwtVerify)(cookieValue, secretKey, {
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
var CRON_OPEN_ID_PREFIX = "cron_";
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
var sdk = new SDKServer();

// server/_core/oauth.ts
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
    const expectedNonce = (0, import_cookie2.parse)(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
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

// server/_core/storageProxy.ts
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

// server/routers.ts
var import_server8 = require("@trpc/server");
var import_zod10 = require("zod");
init_db();

// server/_core/systemRouter.ts
var import_zod = require("zod");

// server/_core/notification.ts
var import_server = require("@trpc/server");
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new import_server.TRPCError({
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

// server/_core/trpc.ts
var import_server2 = require("@trpc/server");
var import_superjson = __toESM(require("superjson"), 1);
var t = import_server2.initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new import_server2.TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new import_server2.TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    import_zod.z.object({
      timestamp: import_zod.z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    import_zod.z.object({
      title: import_zod.z.string().min(1, "title is required"),
      content: import_zod.z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/candidates.ts
var import_server3 = require("@trpc/server");
var import_zod2 = require("zod");
init_db();
init_db();

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

// server/routers/candidates.ts
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
function parseResumeText(text2) {
  const suggestions = [];
  const lines = text2.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
  const lower = text2.toLowerCase();
  return suggestions;
}
async function resolveSuggestedSkills(text2) {
  const existing = await parseResumeText(text2);
  const lower = text2.toLowerCase();
  const skillOut = [];
  const allSkills = await searchSkills("");
  const dbi = await getDb();
  if (!dbi) return existing;
  const [skills2] = await dbi.execute(`SELECT id, name, slug FROM skills`);
  const rows = skills2;
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
var candidateRouter = router({
  // ---- Profile snapshot + completeness (live, read-only) ----
  snapshot: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const profile = await getCandidateProfileByUserId(userId);
    const profileId = profile?.id ?? 0;
    const [skills2, workHistory, education2] = profileId ? await Promise.all([
      listCandidateSkills(profileId),
      listWorkExperiences(profileId),
      listEducation(profileId)
    ]) : [[], [], []];
    return { profile, skills: skills2, workHistory, education: education2, completeness: computeCompleteness({ profile, skills: skills2, workHistory, education: education2 }) };
  }),
  // ---- Draft persistence: each step is saved server-side immediately ----
  getDraft: protectedProcedure.query(({ ctx }) => getProfileDraft(ctx.user.id)),
  saveStep: protectedProcedure.input(import_zod2.z.object({
    step: import_zod2.z.number().int().min(0).max(5),
    data: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.any())
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
  saveBasics: protectedProcedure.input(import_zod2.z.object({
    headline: import_zod2.z.string().max(160).nullable(),
    summary: import_zod2.z.string().max(5e3).nullable(),
    currentTitle: import_zod2.z.string().max(120).nullable(),
    yearsOfExperience: import_zod2.z.number().int().min(0).max(50).nullable()
  })).mutation(async ({ ctx, input }) => {
    return upsertCandidateProfile(ctx.user.id, {
      headline: input.headline ?? null,
      summary: input.summary ?? null,
      currentTitle: input.currentTitle ?? null,
      yearsOfExperience: input.yearsOfExperience ?? null
    });
  }),
  // ---- Step 1: location & preferences ----
  savePreferences: protectedProcedure.input(import_zod2.z.object({
    locationId: import_zod2.z.number().int().nullable(),
    remotePolicy: import_zod2.z.enum(["onsite", "hybrid", "remote", "flexible"]).nullable(),
    desiredSalaryMin: import_zod2.z.number().min(0).nullable(),
    desiredSalaryMax: import_zod2.z.number().min(0).nullable()
  })).mutation(async ({ ctx, input }) => {
    return upsertCandidateProfile(ctx.user.id, {
      locationId: input.locationId ?? null,
      remotePolicy: input.remotePolicy ?? null,
      desiredSalaryMin: input.desiredSalaryMin != null ? String(input.desiredSalaryMin) : null,
      desiredSalaryMax: input.desiredSalaryMax != null ? String(input.desiredSalaryMax) : null
    });
  }),
  // ---- Step 2: skills ----
  addSkill: protectedProcedure.input(import_zod2.z.object({
    skillId: import_zod2.z.number().int(),
    proficiency: import_zod2.z.enum(["beginner", "intermediate", "advanced", "expert"]),
    years: import_zod2.z.number().int().min(0).max(50)
  })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "Create your profile first (save basics)." });
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { and, eq } = await import("drizzle-orm");
    const { candidateSkills: candidateSkills2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const existing = await dbi.select().from(candidateSkills2).where(and(eq(candidateSkills2.profileId, profile.id), eq(candidateSkills2.skillId, input.skillId))).limit(1);
    if (existing.length > 0) {
      await dbi.update(candidateSkills2).set({ proficiency: input.proficiency, years: input.years }).where(eq(candidateSkills2.id, existing[0].id));
    } else {
      await dbi.insert(candidateSkills2).values([{
        profileId: profile.id,
        skillId: input.skillId,
        proficiency: input.proficiency,
        years: input.years
      }]);
    }
    return { ok: true };
  }),
  removeSkill: protectedProcedure.input(import_zod2.z.object({ skillId: import_zod2.z.number().int() })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "No profile" });
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { and, eq } = await import("drizzle-orm");
    const { candidateSkills: candidateSkills2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await dbi.delete(candidateSkills2).where(and(eq(candidateSkills2.profileId, profile.id), eq(candidateSkills2.skillId, input.skillId)));
    return { ok: true };
  }),
  listSkills: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return listCandidateSkills(profile.id);
  }),
  // ---- Step 3: work experience ----
  addWorkExperience: protectedProcedure.input(import_zod2.z.object({
    title: import_zod2.z.string().min(1).max(160),
    company: import_zod2.z.string().min(1).max(160),
    startDate: import_zod2.z.string().nullable(),
    endDate: import_zod2.z.string().nullable(),
    current: import_zod2.z.boolean().default(false),
    description: import_zod2.z.string().max(5e3).nullable()
  })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "Create your profile first." });
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { workExperiences: workExperiences2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await dbi.insert(workExperiences2).values([{
      profileId: profile.id,
      title: input.title,
      company: input.company,
      startDate: input.startDate ? /* @__PURE__ */ new Date(input.startDate + "T00:00:00Z") : null,
      endDate: input.endDate ? /* @__PURE__ */ new Date(input.endDate + "T00:00:00Z") : null,
      current: input.current,
      description: input.description ?? null
    }]);
    return { ok: true };
  }),
  removeWorkExperience: protectedProcedure.input(import_zod2.z.object({ id: import_zod2.z.number().int() })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "No profile" });
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { and, eq } = await import("drizzle-orm");
    const { workExperiences: workExperiences2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await dbi.delete(workExperiences2).where(and(eq(workExperiences2.profileId, profile.id), eq(workExperiences2.id, input.id)));
    return { ok: true };
  }),
  listWorkHistory: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return listWorkExperiences(profile.id);
  }),
  // ---- Step 4: education ----
  addEducation: protectedProcedure.input(import_zod2.z.object({
    institution: import_zod2.z.string().min(1).max(200),
    degree: import_zod2.z.string().min(1).max(160),
    fieldOfStudy: import_zod2.z.string().max(160).nullable(),
    startYear: import_zod2.z.number().int().min(1950).max(2030).nullable(),
    endYear: import_zod2.z.number().int().min(1950).max(2030).nullable()
  })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "Create your profile first." });
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { education: education2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await dbi.insert(education2).values([{
      profileId: profile.id,
      institution: input.institution,
      degree: input.degree,
      fieldOfStudy: input.fieldOfStudy ?? null,
      startYear: input.startYear ?? null,
      endYear: input.endYear ?? null
    }]);
    return { ok: true };
  }),
  removeEducation: protectedProcedure.input(import_zod2.z.object({ id: import_zod2.z.number().int() })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "No profile" });
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { and, eq } = await import("drizzle-orm");
    const { education: education2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await dbi.delete(education2).where(and(eq(education2.profileId, profile.id), eq(education2.id, input.id)));
    return { ok: true };
  }),
  listEducation: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return listEducation(profile.id);
  }),
  // ---- Resume upload: extract + parse, return SUGGESTIONS only ----
  uploadResume: protectedProcedure.input(import_zod2.z.object({
    fileName: import_zod2.z.string().max(255),
    bytesBase64: import_zod2.z.string().min(1)
  })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    const profileId = profile?.id ?? 0;
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "Save your basics before uploading a resume." });
    const bytes = Buffer.from(input.bytesBase64, "base64");
    if (bytes.length > 10 * 1024 * 1024) {
      throw new import_server3.TRPCError({ code: "BAD_REQUEST", message: "Resume too large (max 10MB)." });
    }
    const relKey = `resumes/${profileId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { url } = await storagePut(relKey, bytes, "application/pdf");
    let text2 = "";
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
      text2 = parts.join("\n").replace(/\s{2,}/g, " ");
    } catch (err) {
      throw new import_server3.TRPCError({
        code: "BAD_REQUEST",
        message: "Could not extract text from this PDF. It may be scanned/image-based. Please fill in your profile manually."
      });
    }
    if (text2.trim().length < 50) {
      throw new import_server3.TRPCError({
        code: "BAD_REQUEST",
        message: "Very little text was found in this PDF (it may be an image scan). Please fill in your profile manually."
      });
    }
    const suggestions = await resolveSuggestedSkills(text2);
    if (suggestions.length > 0) {
      await createResumeSuggestions(
        profileId,
        suggestions.map((s) => ({ kind: s.kind, data: s.data }))
      );
    }
    return {
      resumeUrl: url,
      resumeFileName: input.fileName,
      extractedTextLength: text2.length,
      suggestionCount: suggestions.length
    };
  }),
  listSuggestions: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return listResumeSuggestions(profile.id);
  }),
  decideSuggestion: protectedProcedure.input(import_zod2.z.object({
    suggestionId: import_zod2.z.number().int(),
    decision: import_zod2.z.enum(["confirm", "reject"])
  })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "No profile" });
    const suggestions = await listResumeSuggestions(profile.id);
    const suggestion = suggestions.find((s) => s.id === input.suggestionId && s.profileId === profile.id);
    if (!suggestion) {
      throw new import_server3.TRPCError({ code: "NOT_FOUND", message: "Suggestion not found." });
    }
    if (suggestion.status !== "pending") {
      throw new import_server3.TRPCError({ code: "CONFLICT", message: "This suggestion was already decided." });
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
    const dbi = await getDb();
    if (!dbi) throw new import_server3.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { resumeSuggestions: resumeSuggestions2, eq } = { ...await Promise.resolve().then(() => (init_schema(), schema_exports)), eq: (await import("drizzle-orm")).eq };
    const pending = await dbi.select().from(resumeSuggestions2).where(eq(resumeSuggestions2.profileId, profile.id));
    for (const s of pending) {
      if (s.status === "pending") {
        await dbi.update(resumeSuggestions2).set({ status: "rejected" }).where(eq(resumeSuggestions2.id, s.id));
      }
    }
    return { discarded: pending.length };
  })
});

// server/routers/employers.ts
var import_server4 = require("@trpc/server");
var import_zod3 = require("zod");
init_db();
var jobInput = import_zod3.z.object({
  title: import_zod3.z.string().min(3).max(160),
  description: import_zod3.z.string().min(50).max(1e4),
  seniority: import_zod3.z.enum(["junior", "mid", "senior", "lead", "staff"]),
  employmentType: import_zod3.z.enum(["full-time", "part-time", "contract", "internship"]).default("full-time"),
  salaryMin: import_zod3.z.number().min(0).nullable(),
  salaryMax: import_zod3.z.number().min(0).nullable(),
  locationId: import_zod3.z.number().int().nullable(),
  remotePolicy: import_zod3.z.enum(["onsite", "hybrid", "remote", "flexible"]),
  skills: import_zod3.z.array(import_zod3.z.object({
    skillId: import_zod3.z.number().int(),
    weight: import_zod3.z.enum(["required", "preferred"])
  })).min(1).max(25),
  published: import_zod3.z.boolean().default(false)
});
async function requireCompanyMembership(ctx) {
  const membership = await getMyCompanyMembership(ctx.user.id);
  if (!membership) {
    throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "You are not a member of any company. Create a company profile first." });
  }
  return membership;
}
var employerRouter = router({
  // ---- Company ----
  getCompany: publicProcedure.input(import_zod3.z.object({ companyId: import_zod3.z.number().int() })).query(async ({ input }) => {
    const company = await getCompanyById(input.companyId);
    if (!company) throw new import_server4.TRPCError({ code: "NOT_FOUND", message: "Company not found." });
    const loc = company.locationId ? await getLocationById(company.locationId) : null;
    return { ...company, location: loc ?? null };
  }),
  companyJobs: publicProcedure.input(import_zod3.z.object({ companyId: import_zod3.z.number().int() })).query(async ({ input }) => {
    return getCompanyPublishedJobs(input.companyId);
  }),
  myCompany: protectedProcedure.query(async ({ ctx }) => {
    const companies2 = await getUserCompanies(ctx.user.id);
    const membership = await getMyCompanyMembership(ctx.user.id);
    return { companies: companies2, membership };
  }),
  createCompany: protectedProcedure.input(import_zod3.z.object({
    name: import_zod3.z.string().min(2).max(160),
    description: import_zod3.z.string().max(5e3).nullable(),
    industry: import_zod3.z.string().max(100).nullable(),
    website: import_zod3.z.string().max(320).nullable(),
    size: import_zod3.z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable(),
    locationId: import_zod3.z.number().int().nullable()
  })).mutation(async ({ ctx, input }) => {
    return createCompany(input, ctx.user.id);
  }),
  updateCompany: protectedProcedure.input(import_zod3.z.object({
    companyId: import_zod3.z.number().int(),
    name: import_zod3.z.string().min(2).max(160).optional(),
    description: import_zod3.z.string().max(5e3).nullable().optional(),
    industry: import_zod3.z.string().max(100).nullable().optional(),
    website: import_zod3.z.string().max(320).nullable().optional(),
    size: import_zod3.z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable().optional(),
    locationId: import_zod3.z.number().int().nullable().optional()
  })).mutation(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    if (membership.companyId !== input.companyId) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "Not authorized for this company." });
    }
    const dbi = await (await Promise.resolve().then(() => (init_db(), db_exports))).getDb();
    if (!dbi) throw new import_server4.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { companies: companies2, eq } = { ...await Promise.resolve().then(() => (init_schema(), schema_exports)), eq: (await import("drizzle-orm")).eq };
    await dbi.update(companies2).set(input).where(eq(companies2.id, input.companyId));
    return { ok: true };
  }),
  // ---- Jobs ----
  createJob: protectedProcedure.input(jobInput).mutation(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    if (input.salaryMin != null && input.salaryMax != null && input.salaryMin > input.salaryMax) {
      throw new import_server4.TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot exceed maximum salary." });
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
  getJob: protectedProcedure.input(import_zod3.z.object({ jobId: import_zod3.z.number().int() })).query(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    const job = await getJobById(input.jobId);
    if (!job) throw new import_server4.TRPCError({ code: "NOT_FOUND", message: "Job not found." });
    if (job.companyId !== membership.companyId) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
    }
    return job;
  }),
  updateJob: protectedProcedure.input(jobInput.extend({ jobId: import_zod3.z.number().int() })).mutation(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    const job = await getJobById(input.jobId);
    if (!job || job.companyId !== membership.companyId) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
    }
    if (input.salaryMin != null && input.salaryMax != null && input.salaryMin > input.salaryMax) {
      throw new import_server4.TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot exceed maximum salary." });
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
  setPublished: protectedProcedure.input(import_zod3.z.object({ jobId: import_zod3.z.number().int(), published: import_zod3.z.boolean() })).mutation(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    const job = await getJobById(input.jobId);
    if (!job || job.companyId !== membership.companyId) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
    }
    return updateJobPublishState(input.jobId, input.published);
  }),
  deleteJob: protectedProcedure.input(import_zod3.z.object({ jobId: import_zod3.z.number().int() })).mutation(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    const job = await getJobById(input.jobId);
    if (!job || job.companyId !== membership.companyId) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
    }
    await deleteJob(input.jobId);
    return { ok: true };
  }),
  // ---- Applications review ----
  jobApplications: protectedProcedure.input(import_zod3.z.object({ jobId: import_zod3.z.number().int() })).query(async ({ ctx, input }) => {
    const membership = await requireCompanyMembership(ctx);
    const job = await getJobById(input.jobId);
    if (!job || job.companyId !== membership.companyId) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
    }
    return getJobApplications(input.jobId);
  }),
  setApplicationStatus: protectedProcedure.input(import_zod3.z.object({
    applicationId: import_zod3.z.number().int(),
    status: import_zod3.z.enum(["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"])
  })).mutation(async ({ ctx, input }) => {
    await requireCompanyMembership(ctx);
    return updateApplicationStatus(input.applicationId, input.status);
  })
});

// server/routers/jobs.ts
var import_server5 = require("@trpc/server");
var import_zod4 = require("zod");
init_db();
var jobsRouter = router({
  browse: publicProcedure.input(import_zod4.z.object({
    page: import_zod4.z.number().int().min(1).default(1),
    pageSize: import_zod4.z.number().int().min(1).max(50).default(20),
    query: import_zod4.z.string().max(200).optional(),
    locationId: import_zod4.z.number().int().optional(),
    remotePolicy: import_zod4.z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
    seniority: import_zod4.z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
    minSalary: import_zod4.z.number().int().optional(),
    maxSalary: import_zod4.z.number().int().optional()
  })).query(async ({ input }) => getPublishedJobs(input)),
  /** Alias-aware ranked search: weighted text + skills + distance + recency + salary, with explainable scores. */
  ranked: publicProcedure.input(import_zod4.z.object({
    query: import_zod4.z.string().max(200).optional(),
    locationId: import_zod4.z.number().int().optional(),
    remotePolicy: import_zod4.z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
    seniority: import_zod4.z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
    minSalary: import_zod4.z.number().int().optional(),
    maxSalary: import_zod4.z.number().int().optional(),
    candidateLat: import_zod4.z.number().optional(),
    candidateLng: import_zod4.z.number().optional(),
    cursor: import_zod4.z.tuple([import_zod4.z.number(), import_zod4.z.number()]).nullable().default(null),
    pageSize: import_zod4.z.number().int().min(1).max(50).default(20)
  })).query(async ({ input }) => {
    let skillIds = [];
    if (input.query) {
      const resolved = await resolveSkillIdsByQuery(input.query);
      skillIds = Array.from(resolved);
    }
    return rankedSearchJobs({ ...input, skillIds });
  }),
  facetCounts: publicProcedure.input(import_zod4.z.object({
    query: import_zod4.z.string().max(200).optional(),
    /** Active filters from OTHER dimensions — each facet is counted with its own dimension excluded. */
    remotePolicy: import_zod4.z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
    seniority: import_zod4.z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
    minSalary: import_zod4.z.number().int().optional(),
    maxSalary: import_zod4.z.number().int().optional()
  })).query(async ({ input }) => {
    let skillIds = [];
    if (input.query) {
      const resolved = await resolveSkillIdsByQuery(input.query);
      skillIds = Array.from(resolved);
    }
    return facetCountsForJobs({ ...input, skillIds });
  }),
  detail: publicProcedure.input(import_zod4.z.object({ id: import_zod4.z.number().int() })).query(({ input }) => getJobById(input.id)),
  locations: publicProcedure.query(() => listLocations())
});
var applicationsRouter = router({
  submitApplication: protectedProcedure.input(import_zod4.z.object({
    jobId: import_zod4.z.number().int(),
    coverNote: import_zod4.z.string().max(5e3).optional()
  })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new import_server5.TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Create your candidate profile before applying to jobs."
      });
    }
    const job = await getJobById(input.jobId);
    if (!job || !job.published) {
      throw new import_server5.TRPCError({ code: "NOT_FOUND", message: "This job is not accepting applications." });
    }
    return applyToJob(input.jobId, profile.id, input.coverNote);
  }),
  myApplications: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return getMyApplications(profile.id);
  }),
  hasApplied: protectedProcedure.input(import_zod4.z.object({ jobId: import_zod4.z.number().int() })).query(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return { applied: false };
    const dbi = await getDb();
    if (!dbi) return { applied: false };
    const { eq, and } = await import("drizzle-orm");
    const { applications: applications2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const rows = await dbi.select().from(applications2).where(and(eq(applications2.jobId, input.jobId), eq(applications2.profileId, profile.id))).limit(1);
    return { applied: rows.length > 0, status: rows[0]?.status ?? null };
  })
});
var candidateSearchRouter = router({
  run: protectedProcedure.input(import_zod4.z.object({
    jobId: import_zod4.z.number().int(),
    skillIds: import_zod4.z.array(import_zod4.z.number().int()).optional(),
    locationId: import_zod4.z.number().int().optional(),
    remotePolicy: import_zod4.z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
    pageSize: import_zod4.z.number().int().min(1).max(50).default(20)
  })).query(async ({ input }) => {
    const job = await getJobById(input.jobId);
    if (!job || !job.published) throw new import_server5.TRPCError({ code: "NOT_FOUND", message: "Job not published." });
    let skillIds = input.skillIds;
    if (!skillIds) {
      const rows = await getJobSkills(input.jobId);
      skillIds = rows.map((r) => r.skillId);
    }
    return rankedSearchCandidates({ ...input, jobId: input.jobId, skillIds });
  })
});
var savedSearchesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => listSavedSearches(ctx.user.id)),
  save: protectedProcedure.input(import_zod4.z.object({
    name: import_zod4.z.string().min(1).max(120),
    query: import_zod4.z.object({
      query: import_zod4.z.string().max(200).optional(),
      remotePolicy: import_zod4.z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
      seniority: import_zod4.z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
      minSalary: import_zod4.z.number().int().optional(),
      maxSalary: import_zod4.z.number().int().optional()
    })
  })).mutation(async ({ ctx, input }) => {
    const id = await createSavedSearch(ctx.user.id, input.name, input.query);
    if (!id) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not save search." });
    return { id };
  }),
  delete: protectedProcedure.input(import_zod4.z.object({ id: import_zod4.z.number().int() })).mutation(async ({ ctx, input }) => {
    const ok = await deleteSavedSearch(input.id, ctx.user.id);
    if (!ok) throw new import_server5.TRPCError({ code: "NOT_FOUND", message: "Saved search not found." });
    return { deleted: true };
  }),
  /** Re-run a saved search against the ranked engine. */
  run: protectedProcedure.input(import_zod4.z.object({ id: import_zod4.z.number().int() })).query(async ({ ctx, input }) => {
    const rows = await listSavedSearches(ctx.user.id);
    const saved = rows.find((s) => s.id === input.id);
    if (!saved) throw new import_server5.TRPCError({ code: "NOT_FOUND", message: "Saved search not found." });
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

// server/routers/ats.ts
var import_server6 = require("@trpc/server");
var import_zod5 = require("zod");
init_db();
var ATS_STATUS = ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"];
async function requireCompanyJobMember(ctx, jobId) {
  const job = await getJobById(jobId);
  if (!job) throw new import_server6.TRPCError({ code: "NOT_FOUND", message: "Job not found." });
  const membership = await getMyCompanyMembership(ctx.user.id);
  if (!membership) throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "You are not a member of any company." });
  if (membership.companyId !== job.companyId)
    throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "You do not have access to this job." });
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
var atsRouter = router({
  /** Immutable stage-transition history for an application. */
  history: protectedProcedure.input(import_zod5.z.object({ applicationId: import_zod5.z.number().int() })).query(async ({ ctx, input }) => {
    const app2 = await getApplicationById(input.applicationId);
    if (!app2) throw new import_server6.TRPCError({ code: "NOT_FOUND", message: "Application not found." });
    const job = await getJobById(app2.jobId);
    if (!job) throw new import_server6.TRPCError({ code: "NOT_FOUND", message: "Job not found." });
    const membership = await getMyCompanyMembership(ctx.user.id);
    if (!membership || membership.companyId !== job.companyId)
      throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "You do not have access to this application." });
    return getStageHistory(input.applicationId);
  }),
  /** Employer moves an application to a new stage (immutable event appended). */
  move: protectedProcedure.input(import_zod5.z.object({
    applicationId: import_zod5.z.number().int(),
    jobId: import_zod5.z.number().int(),
    toStatus: import_zod5.z.enum(ATS_STATUS),
    note: import_zod5.z.string().max(1e3).optional()
  })).mutation(async ({ ctx, input }) => {
    const { job } = await requireCompanyJobMember(ctx, input.jobId);
    const app2 = await getApplicationById(input.applicationId);
    if (!app2 || app2.jobId !== job.id)
      throw new import_server6.TRPCError({ code: "NOT_FOUND", message: "Application not found on this job." });
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
  withdraw: protectedProcedure.input(import_zod5.z.object({ applicationId: import_zod5.z.number().int() })).mutation(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile) throw new import_server6.TRPCError({ code: "PRECONDITION_FAILED", message: "No candidate profile." });
    const app2 = await getApplicationById(input.applicationId);
    if (!app2 || app2.profileId !== profile.id)
      throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "This is not your application." });
    return moveApplication(input.applicationId, "withdrawn", ctx.user.id, "Withdrawn by candidate");
  }),
  /** Full conversation thread scoped to an application (both parties). */
  conversation: protectedProcedure.input(import_zod5.z.object({ applicationId: import_zod5.z.number().int() })).query(async ({ ctx, input }) => {
    const app2 = await getApplicationById(input.applicationId);
    if (!app2) throw new import_server6.TRPCError({ code: "NOT_FOUND", message: "Application not found." });
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    const job = await getJobById(app2.jobId);
    let allowed = false;
    if (profile && app2.profileId === profile.id) allowed = true;
    if (job) {
      const membership = await getMyCompanyMembership(ctx.user.id);
      if (membership && membership.companyId === job.companyId) allowed = true;
    }
    if (!allowed) throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "You are not part of this application." });
    await markMessagesRead(input.applicationId, ctx.user.id);
    return getThread(input.applicationId);
  }),
  /** Send a message inside an application conversation. */
  sendMessage: protectedProcedure.input(import_zod5.z.object({ applicationId: import_zod5.z.number().int(), text: import_zod5.z.string().min(1).max(5e3) })).mutation(async ({ ctx, input }) => {
    const app2 = await getApplicationById(input.applicationId);
    if (!app2) throw new import_server6.TRPCError({ code: "NOT_FOUND", message: "Application not found." });
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
    if (!allowed) throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "You are not part of this application." });
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
  unreadCounts: protectedProcedure.input(import_zod5.z.object({ applicationIds: import_zod5.z.array(import_zod5.z.number().int()).max(100) })).query(async ({ ctx, input }) => {
    if (input.applicationIds.length === 0) return [];
    const counts = await getUnreadCounts(input.applicationIds, ctx.user.id);
    return input.applicationIds.map((id) => ({ applicationId: id, unread: counts.get(id) ?? 0 }));
  }),
  /** Employer views a candidate profile (recorded once per employer per profile). */
  recordProfileView: protectedProcedure.input(import_zod5.z.object({ profileId: import_zod5.z.number().int() })).mutation(async ({ ctx, input }) => {
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
  profileViewCount: protectedProcedure.input(import_zod5.z.object({ profileId: import_zod5.z.number().int() })).query(async ({ ctx, input }) => {
    const profile = await getCandidateProfileByUserId(ctx.user.id);
    if (!profile || profile.id !== input.profileId)
      throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "You can only view your own profile stats." });
    return { count: await getProfileViewCount(input.profileId) };
  }),
  /** Spam score preview for a job draft (employer-facing heuristic). */
  spamScore: protectedProcedure.input(import_zod5.z.object({
    title: import_zod5.z.string().max(200),
    description: import_zod5.z.string().max(1e4),
    salaryMin: import_zod5.z.number().int().optional(),
    salaryMax: import_zod5.z.number().int().optional()
  })).query(({ input }) => ({ score: spamScoreJob(input) })),
  /** Admin moderation queue: pending reports. */
  reports: protectedProcedure.input(import_zod5.z.object({ status: import_zod5.z.enum(["pending", "resolved", "dismissed"]).default("pending") })).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "Admins only." });
    return listReports(input.status);
  }),
  resolveReport: protectedProcedure.input(import_zod5.z.object({ id: import_zod5.z.number().int(), status: import_zod5.z.enum(["resolved", "dismissed"]) })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new import_server6.TRPCError({ code: "FORBIDDEN", message: "Admins only." });
    return resolveReport(input.id, input.status);
  }),
  reportTarget: protectedProcedure.input(import_zod5.z.object({ targetType: import_zod5.z.enum(["job", "profile"]), targetId: import_zod5.z.number().int(), reason: import_zod5.z.string().min(1).max(500) })).mutation(async ({ ctx, input }) => createReport(input.targetType, input.targetId, ctx.user.id, input.reason))
});

// server/routers/skills.ts
var import_zod6 = require("zod");
init_db();
init_db();
var skillsRouter = router({
  stats: publicProcedure.query(async () => {
    const dbi = await getDb();
    if (!dbi) return { candidates: 5100, jobs: 2100, applications: 22e3, skills: 439 };
    const count = async (t2) => {
      const [rows] = await dbi.execute(`SELECT COUNT(*) AS n FROM ${t2}`);
      return rows[0]?.n ?? 0;
    };
    const [candidates, jobs2, applications2, skills2] = await Promise.all([
      count("candidateProfiles"),
      count("jobs"),
      count("applications"),
      count("skills")
    ]);
    return { candidates, jobs: jobs2, applications: applications2, skills: skills2 };
  }),
  search: publicProcedure.input(import_zod6.z.object({ term: import_zod6.z.string().max(100) })).query(({ input }) => searchSkills(input.term)),
  resolve: publicProcedure.input(import_zod6.z.object({ term: import_zod6.z.string().max(100) })).query(({ input }) => resolveSkillByTerm(input.term)),
  categories: publicProcedure.query(() => listSkillCategories()),
  byCategory: publicProcedure.input(import_zod6.z.object({ category: import_zod6.z.string(), limit: import_zod6.z.number().min(1).max(200).default(50) })).query(({ input }) => listSkillsByCategory(input.category, input.limit)),
  // Resolved canonical names for search terms (alias breadcrumbs)
  namesByIds: publicProcedure.input(import_zod6.z.object({ ids: import_zod6.z.array(import_zod6.z.number().int()).max(50) })).query(async ({ input }) => {
    if (input.ids.length === 0) return [];
    const dbi = await getDb();
    if (!dbi) return [];
    const [rows] = await dbi.execute(`SELECT id, name, slug FROM skills WHERE id IN (${input.ids.join(",")})`);
    return rows;
  })
});

// server/routers/notifications.ts
var import_zod7 = require("zod");
init_db();
var notificationsRouter = router({
  centre: protectedProcedure.query(async ({ ctx }) => listNotifications(ctx.user.id)),
  unreadCount: protectedProcedure.query(async ({ ctx }) => ({ count: await getUnreadNotificationCount(ctx.user.id) })),
  markRead: protectedProcedure.input(import_zod7.z.object({ id: import_zod7.z.number().int() })).mutation(async ({ ctx, input }) => markNotificationRead(input.id, ctx.user.id)),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => markAllNotificationsRead(ctx.user.id)),
  prefs: protectedProcedure.input(import_zod7.z.object({ channel: import_zod7.z.enum(["in_app", "email"]), eventType: import_zod7.z.string().max(60) })).query(async ({ ctx, input }) => ({
    enabled: await getNotificationPrefs(ctx.user.id, input.channel, input.eventType)
  })),
  setPref: protectedProcedure.input(import_zod7.z.object({
    channel: import_zod7.z.enum(["in_app", "email"]),
    eventType: import_zod7.z.string().max(60),
    enabled: import_zod7.z.boolean()
  })).mutation(async ({ ctx, input }) => setNotificationPref(ctx.user.id, input.channel, input.eventType, input.enabled)),
  /** Public one-click unsubscribe — no login required. */
  unsubscribe: publicProcedure.input(import_zod7.z.object({ token: import_zod7.z.string().min(1).max(128) })).mutation(async ({ input }) => unsubscribeByToken(input.token))
});

// server/routers/digests.ts
var import_server7 = require("@trpc/server");
var import_zod8 = require("zod");
init_db();
var digestsRouter = router({
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
    if (ctx.user.role !== "admin") throw new import_server7.TRPCError({ code: "FORBIDDEN", message: "Admins only." });
    return getQueueStats();
  }),
  deadLetters: protectedProcedure.input(import_zod8.z.object({ limit: import_zod8.z.number().int().min(1).max(200).default(50) })).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new import_server7.TRPCError({ code: "FORBIDDEN", message: "Admins only." });
    return listDeadQueueRows(input.limit);
  })
});

// server/routers/queue.ts
var import_zod9 = require("zod");
init_db();
async function dispatchOne(row) {
  const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
  let recipientEmail = null;
  const users2 = await getUsersByIds([row.recipientUserId]);
  recipientEmail = users2[0]?.email ?? null;
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
var queueRouter = router({
  /**
   * Worker entrypoint for the processQueue cron (Heartbeat, every minute):
   * claim → dispatch → sent/failed with exponential backoff → dead-letter.
   * Idempotent: job_key is unique so re-running never duplicates work.
   */
  processQueue: publicProcedure.input(import_zod9.z.object({ batchSize: import_zod9.z.number().int().min(1).max(100).default(20) }).optional()).mutation(async ({ input }) => {
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

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    loginWithGoogle: publicProcedure.input(
      import_zod10.z.object({
        email: import_zod10.z.string().optional(),
        name: import_zod10.z.string().optional(),
        userType: import_zod10.z.enum(["candidate", "employer", "both"]).optional()
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
        throw new import_server8.TRPCError({
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

// server/_core/context.ts
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

// api/index.ts
init_db();
var REQUIRED_SERVER_VARS = ["DATABASE_URL", "JWT_SECRET", "OAUTH_SERVER_URL"];
var missing = REQUIRED_SERVER_VARS.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("[startup] Missing required environment variables:", missing.join(", "));
} else {
  console.log("[startup] All required environment variables present.");
}
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
app.get("/api/health", async (_req, res) => {
  try {
    const hasDbUrl = Boolean(process.env.DATABASE_URL);
    const database = await getDb();
    res.json({
      status: "ok",
      hasDbUrl,
      dbConnected: Boolean(database),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: String(err?.message ?? err) });
  }
});
app.use(
  "/api/trpc",
  (0, import_express2.createExpressMiddleware)({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`[tRPC] Error on /${path}:`, error.message);
    }
  })
);
app.post("/api/scheduled/processQueue", async (_req, res) => {
  try {
    const result = await runQueueWorker();
    res.json({ ok: true, result, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (e) {
    console.error("[scheduled] processQueue error:", e?.message ?? e);
    res.status(500).json({ error: String(e?.message ?? e), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
});
app.post("/api/scheduled/digests", async (_req, res) => {
  try {
    const result = await runAllScheduledDigests();
    res.json({ ok: true, result, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (e) {
    console.error("[scheduled] digests error:", e?.message ?? e);
    res.status(500).json({ error: String(e?.message ?? e), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
});
function handler(req, res) {
  app(req, res);
}
