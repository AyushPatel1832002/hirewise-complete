import {
  boolean,
  date,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  uniqueIndex,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with a `userType` so a single account can act as candidate, employer, or both.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["candidate", "employer", "both"]).default("candidate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ---------------------------------------------------------------------------
// Candidate profile
// ---------------------------------------------------------------------------
export const candidateProfiles = mysqlTable("candidateProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  headline: varchar("headline", { length: 160 }),
  summary: text("summary"),
  currentTitle: varchar("currentTitle", { length: 120 }),
  yearsOfExperience: smallint("yearsOfExperience"),
  locationId: int("locationId"),
  remotePolicy: mysqlEnum("remotePolicy", ["onsite", "hybrid", "remote", "flexible"]),
  desiredSalaryMin: decimal("desiredSalaryMin", { precision: 12, scale: 2 }),
  desiredSalaryMax: decimal("desiredSalaryMax", { precision: 12, scale: 2 }),
  resumeUrl: varchar("resumeUrl", { length: 512 }),
  resumeFileName: varchar("resumeFileName", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type InsertCandidateProfile = typeof candidateProfiles.$inferInsert;

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 80 }).notNull(),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  /** Geographic coordinates for geo-distance ranking. Nullable for unknown rows. */
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// ---------------------------------------------------------------------------
// Skill taxonomy (normalised controlled vocabulary)
// ---------------------------------------------------------------------------
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  category: varchar("category", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

/**
 * Aliases resolve at QUERY time, never at write time.
 * Stored rows are normalised to lowercase; lookups must use lower(name).
 */
export const skillAliases = mysqlTable("skillAliases", {
  id: int("id").autoincrement().primaryKey(),
  alias: varchar("alias", { length: 100 }).notNull().unique(),
  skillId: int("skillId").notNull(),
});

export type SkillAlias = typeof skillAliases.$inferSelect;
export type InsertSkillAlias = typeof skillAliases.$inferInsert;

// ---------------------------------------------------------------------------
// Candidate skill tagging
// ---------------------------------------------------------------------------
export const candidateSkills = mysqlTable("candidateSkills", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  skillId: int("skillId").notNull(),
  proficiency: mysqlEnum("proficiency", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  years: smallint("years").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CandidateSkill = typeof candidateSkills.$inferSelect;
export type InsertCandidateSkill = typeof candidateSkills.$inferInsert;

// ---------------------------------------------------------------------------
// Work history & education (structured profile content)
// ---------------------------------------------------------------------------
export const workExperiences = mysqlTable("workExperiences", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  company: varchar("company", { length: 160 }).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  current: boolean("current").default(false).notNull(),
  description: text("description"),
});

export type WorkExperience = typeof workExperiences.$inferSelect;
export type InsertWorkExperience = typeof workExperiences.$inferInsert;

export const education = mysqlTable("education", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  institution: varchar("institution", { length: 200 }).notNull(),
  degree: varchar("degree", { length: 160 }).notNull(),
  fieldOfStudy: varchar("fieldOfStudy", { length: 160 }),
  startYear: smallint("startYear"),
  endYear: smallint("endYear"),
});

export type Education = typeof education.$inferSelect;
export type InsertEducation = typeof education.$inferInsert;

// ---------------------------------------------------------------------------
// Resume parse suggestions (candidate must CONFIRM before anything is written)
// ---------------------------------------------------------------------------
export const resumeSuggestions = mysqlTable("resumeSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  kind: mysqlEnum("kind", ["workExperience", "education", "skill"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "rejected"]).default("pending").notNull(),
  data: json("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ResumeSuggestion = typeof resumeSuggestions.$inferSelect;
export type InsertResumeSuggestion = typeof resumeSuggestions.$inferInsert;

// ---------------------------------------------------------------------------
// Profile build draft — server-side per-step persistence
// ---------------------------------------------------------------------------
export const profileDrafts = mysqlTable("profileDrafts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentStep: smallint("currentStep").default(0).notNull(),
  stepData: json("stepData").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProfileDraft = typeof profileDrafts.$inferSelect;
export type InsertProfileDraft = typeof profileDrafts.$inferInsert;

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull().unique(),
  description: text("description"),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 320 }),
  size: mysqlEnum("size", ["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  locationId: int("locationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export const companyMembers = mysqlTable("companyMembers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyId: int("companyId").notNull(),
  role: mysqlEnum("role", ["owner", "member"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompanyMember = typeof companyMembers.$inferSelect;
export type InsertCompanyMember = typeof companyMembers.$inferInsert;

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  seniority: mysqlEnum("seniority", ["junior", "mid", "senior", "lead", "staff"]).notNull(),
  employmentType: mysqlEnum("employmentType", ["full-time", "part-time", "contract", "internship"]).default("full-time").notNull(),
  salaryMin: decimal("salaryMin", { precision: 12, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 12, scale: 2 }),
  locationId: int("locationId"),
  remotePolicy: mysqlEnum("remotePolicy", ["onsite", "hybrid", "remote", "flexible"]).notNull(),
  published: boolean("published").default(false).notNull(),
  applicationCount: int("applicationCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Job skill requirements. weight distinguishes required vs preferred:
 * - weight: required (must-have, hard filter)
 * - weight: preferred (nice-to-have, boosts match)
 */
export const jobSkills = mysqlTable("jobSkills", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  skillId: int("skillId").notNull(),
  weight: mysqlEnum("weight", ["required", "preferred"]).notNull(),
});

export type JobSkill = typeof jobSkills.$inferSelect;
export type InsertJobSkill = typeof jobSkills.$inferInsert;

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  profileId: int("profileId").notNull(),
  /** Status is derived from the latest row in applicationStageEvents; kept as a denormalised cache. */
  status: mysqlEnum("status", ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]).default("applied").notNull(),
  coverNote: text("coverNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** One application per candidate per job — duplicates are rejected at the database level. */
export const applicationsJobProfileUniqueIdx = uniqueIndex("applications_job_profile_uq").on(
  applications.jobId,
  applications.profileId,
);

/**
 * Immutable stage-transition history. The current stage is always the last event.
 * Backward moves create a new event — history is never mutated or deleted.
 */
export const applicationStageEvents = mysqlTable("applicationStageEvents", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  fromStatus: mysqlEnum("fromStatus", ["none", "applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]).default("none").notNull(),
  toStatus: mysqlEnum("toStatus", ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]).notNull(),
  note: text("note"),
  actorUserId: int("actorUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationStageEvent = typeof applicationStageEvents.$inferSelect;
export type InsertApplicationStageEvent = typeof applicationStageEvents.$inferInsert;

/** Employer views of candidate profiles, shown on the candidate dashboard. */
export const profileViews = mysqlTable("profileViews", {
  id: int("id").autoincrement().primaryKey(),
  employerUserId: int("employerUserId").notNull(),
  profileId: int("profileId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfileView = typeof profileViews.$inferSelect;
export type InsertProfileView = typeof profileViews.$inferInsert;

/** Messages scoped to an application, with per-recipient read state. */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  senderUserId: int("senderUserId").notNull(),
  text: text("text").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/** Reports submitted to the moderation queue (jobs or profiles). */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("targetType", ["job", "profile"]).notNull(),
  targetId: int("targetId").notNull(),
  reporterUserId: int("reporterUserId").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["pending", "resolved", "dismissed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/** Named, persisted search definitions the candidate can re-run. */
export const savedSearches = mysqlTable("savedSearches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  query: json("query").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Notification preferences: per user, per channel, per event type.
 * One row per (userId, channel, eventType); absence means enabled by default.
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  channel: mysqlEnum("channel", ["in_app", "email"]).notNull(),
  eventType: varchar("eventType", { length: 60 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/** One-click, tokenised unsubscribe — no login required. */
export const unsubscribeTokens = mysqlTable("unsubscribeTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  channel: mysqlEnum("channel", ["in_app", "email"]).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UnsubscribeToken = typeof unsubscribeTokens.$inferSelect;
export type InsertUnsubscribeToken = typeof unsubscribeTokens.$inferInsert;

/** In-app notifications with read state. */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 60 }).notNull(),
  payload: json("payload"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * The notification job queue. Workers dequeue pending rows, mark processing,
 * and either clear (sent) or schedule retry with exponential backoff.
 * job_key is unique → reprocessing the same logical job never duplicates work.
 */
export const notificationQueue = mysqlTable("notificationQueue", {
  id: int("id").autoincrement().primaryKey(),
  jobKey: varchar("jobKey", { length: 255 }).notNull().unique(),
  channel: mysqlEnum("channel", ["in_app", "email"]).notNull(),
  recipientUserId: int("recipientUserId").notNull(),
  eventType: varchar("eventType", { length: 60 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  payload: json("payload").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "sent", "failed", "dead"]).default("pending").notNull(),
  retryCount: int("retryCount").default(0).notNull(),
  backoffUntil: timestamp("backoffUntil"),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationQueueRow = typeof notificationQueue.$inferSelect;
export type InsertNotificationQueueRow = typeof notificationQueue.$inferInsert;

/** Per-send email log, the source of truth for what actually went out. */
export const emailSendLog = mysqlTable("emailSendLog", {
  id: int("id").autoincrement().primaryKey(),
  queueId: int("queueId"),
  recipientUserId: int("recipientUserId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  subject: varchar("subject", { length: 255 }),
  outcome: mysqlEnum("outcome", ["sent", "skipped_no_email", "transport_error", "logged_only"]).notNull(),
  providerResponse: text("providerResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSendLog = typeof emailSendLog.$inferSelect;

/** Digest runs: each saved-search digest execution, one row per (savedSearch, frequency, window). */
export const digestRuns = mysqlTable("digestRuns", {
  id: int("id").autoincrement().primaryKey(),
  savedSearchId: int("savedSearchId").notNull(),
  userId: int("userId").notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly"]).notNull(),
  windowStart: timestamp("windowStart").notNull(),
  windowEnd: timestamp("windowEnd").notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  jobsSent: int("jobsSent").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DigestRun = typeof digestRuns.$inferSelect;
export type InsertDigestRun = typeof digestRuns.$inferInsert;

/** Exactly which jobs were sent in which digest run — the dedup ledger. */
export const digestSent = mysqlTable("digestSent", {
  id: int("id").autoincrement().primaryKey(),
  digestRunId: int("digestRunId").notNull(),
  jobId: int("jobId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DigestSent = typeof digestSent.$inferSelect;
export type InsertDigestSent = typeof digestSent.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;
