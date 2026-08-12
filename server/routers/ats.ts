import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

const ATS_STATUS = ["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"] as const;

async function requireCompanyJobMember(ctx: { user: { id: number; role: string } }, jobId: number) {
  const job = await db.getJobById(jobId);
  if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found." });
  const membership = await db.getMyCompanyMembership(ctx.user.id);
  if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of any company." });
  if (membership.companyId !== job.companyId)
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this job." });
  return { job, membership };
}

async function applicantUserId(applicationId: number): Promise<number> {
  const app = await db.getApplicationById(applicationId);
  if (!app) return 0;
  const profile = await db.getCandidateProfileById(app.profileId);
  return profile?.userId ?? 0;
}

async function employerUserId(companyId: number): Promise<number> {
  const owner = await db.getCompanyOwner(companyId);
  return owner ?? 0;
}

/** Heuristic spam score for a job post (0–1). Factors: caps ratio, keyword stuffing,
 *  salary-signal mismatch, and overly short description. */
export function spamScoreJob(input: { title: string; description: string; salaryMin?: number | null; salaryMax?: number | null }) {
  let score = 0;
  const letters = (s: string) => s.replace(/[^A-Za-z]/g, "");
  const titleLetters = letters(input.title);
  if (titleLetters.length > 0 && titleLetters.length - letters(input.title.toLowerCase()).length > titleLetters.length * 0.4) score += 0.25;
  if (input.description.trim().split(/\s+/).length < 25) score += 0.25;
  const lowSalary = input.salaryMin != null && input.salaryMax != null && Number(input.salaryMax) > 0 && Number(input.salaryMin) / Number(input.salaryMax) < 0.4;
  if (lowSalary) score += 0.2;
  if (/\$\$|\$\s*\d|cash|guarante/i.test(input.title)) score += 0.15;
  return Math.min(1, score);
}

export const atsRouter = router({
  /** Immutable stage-transition history for an application. */
  history: protectedProcedure
    .input(z.object({ applicationId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const app = await db.getApplicationById(input.applicationId);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found." });
      const job = await db.getJobById(app.jobId);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found." });
      const membership = await db.getMyCompanyMembership(ctx.user.id);
      if (!membership || membership.companyId !== job.companyId)
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this application." });
      return db.getStageHistory(input.applicationId);
    }),

  /** Employer moves an application to a new stage (immutable event appended). */
  move: protectedProcedure
    .input(z.object({
      applicationId: z.number().int(),
      jobId: z.number().int(),
      toStatus: z.enum(ATS_STATUS),
      note: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { job } = await requireCompanyJobMember(ctx, input.jobId);
      const app = await db.getApplicationById(input.applicationId);
      if (!app || app.jobId !== job.id)
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found on this job." });
      const result = await db.moveApplication(input.applicationId, input.toStatus, ctx.user.id, input.note);
      // Notification event: employer-initiated stage change → candidate
      if (result.status !== app.status) {
        const candidateUserId = await applicantUserId(input.applicationId);
        if (candidateUserId) {
          await db.enqueueNotification({
            jobKey: `ats-move-${input.applicationId}-${result.status}`,
            channel: "email",
            recipientUserId: candidateUserId,
            eventType: "application.stage_changed",
            subject: `Your application to "${job.title}" moved to ${result.status}`,
            payload: { applicationId: input.applicationId, jobId: job.id, toStatus: result.status },
          });
          await db.enqueueNotification({
            jobKey: `ats-stage-${input.applicationId}-${result.status}`,
            channel: "in_app",
            recipientUserId: candidateUserId,
            eventType: "application.stage_changed",
            subject: `Your application to "${job.title}" moved to ${result.status}`,
            payload: { applicationId: input.applicationId, jobId: job.id, toStatus: result.status },
          });
        }
      }
      return result;
    }),

  /** Candidate withdraws their own application (appends a withdrawn event). */
  withdraw: protectedProcedure
    .input(z.object({ applicationId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No candidate profile." });
      const app = await db.getApplicationById(input.applicationId);
      if (!app || app.profileId !== profile.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "This is not your application." });
      return db.moveApplication(input.applicationId, "withdrawn", ctx.user.id, "Withdrawn by candidate");
    }),

  /** Full conversation thread scoped to an application (both parties). */
  conversation: protectedProcedure
    .input(z.object({ applicationId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const app = await db.getApplicationById(input.applicationId);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found." });
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      const job = await db.getJobById(app.jobId);
      let allowed = false;
      if (profile && app.profileId === profile.id) allowed = true;
      if (job) {
        const membership = await db.getMyCompanyMembership(ctx.user.id);
        if (membership && membership.companyId === job.companyId) allowed = true;
      }
      if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this application." });
      // Mark messages as read for the opener (idempotent)
      await db.markMessagesRead(input.applicationId, ctx.user.id);
      return db.getThread(input.applicationId);
    }),

  /** Send a message inside an application conversation. */
  sendMessage: protectedProcedure
    .input(z.object({ applicationId: z.number().int(), text: z.string().min(1).max(5000) }))
    .mutation(async ({ ctx, input }) => {
      const app = await db.getApplicationById(input.applicationId);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found." });
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      const job = await db.getJobById(app.jobId);
      let recipientUserId = 0;
      let allowed = false;
      if (profile && app.profileId === profile.id) {
        allowed = true;
        if (job) recipientUserId = await employerUserId(job.companyId);
      }
      if (!allowed && job) {
        const membership = await db.getMyCompanyMembership(ctx.user.id);
        if (membership && membership.companyId === job.companyId) {
          allowed = true;
          recipientUserId = await applicantUserId(input.applicationId);
        }
      }
      if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this application." });
      const { messageId } = await db.sendMessage(input.applicationId, ctx.user.id, input.text);
      if (recipientUserId) {
        const title = job ? `new message on "${job.title}"` : "new message";
        await db.enqueueNotification({
          jobKey: `ats-msg-${input.applicationId}-${messageId}`,
          channel: "email",
          recipientUserId,
          eventType: "application.message",
          subject: `New message on ${title}`,
          payload: { applicationId: input.applicationId, messageId },
        });
        await db.enqueueNotification({
          jobKey: `ats-msg-inapp-${input.applicationId}-${messageId}`,
          channel: "in_app",
          recipientUserId,
          eventType: "application.message",
          subject: `New message on ${title}`,
          payload: { applicationId: input.applicationId, messageId },
        });
      }
      return { messageId };
    }),

  /** Unread message counts per application for the current user. */
  unreadCounts: protectedProcedure
    .input(z.object({ applicationIds: z.array(z.number().int()).max(100) }))
    .query(async ({ ctx, input }) => {
      if (input.applicationIds.length === 0) return [];
      const counts = await db.getUnreadCounts(input.applicationIds, ctx.user.id);
      return input.applicationIds.map((id) => ({ applicationId: id, unread: counts.get(id) ?? 0 }));
    }),

  /** Employer views a candidate profile (recorded once per employer per profile). */
  recordProfileView: protectedProcedure
    .input(z.object({ profileId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      await db.recordProfileView(ctx.user.id, input.profileId);
      const profile = await db.getCandidateProfileById(input.profileId);
      if (profile) {
        await db.enqueueNotification({
          jobKey: `profile-view-${input.profileId}-${ctx.user.id}`,
          channel: "in_app",
          recipientUserId: profile.userId,
          eventType: "profile.viewed",
          subject: "An employer viewed your profile",
          payload: { profileId: input.profileId },
        });
      }
      return { profileId: input.profileId };
    }),

  profileViewCount: protectedProcedure
    .input(z.object({ profileId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile || profile.id !== input.profileId)
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only view your own profile stats." });
      return { count: await db.getProfileViewCount(input.profileId) };
    }),

  /** Spam score preview for a job draft (employer-facing heuristic). */
  spamScore: protectedProcedure
    .input(z.object({
      title: z.string().max(200),
      description: z.string().max(10000),
      salaryMin: z.number().int().optional(),
      salaryMax: z.number().int().optional(),
    }))
    .query(({ input }) => ({ score: spamScoreJob(input) })),

  /** Admin moderation queue: pending reports. */
  reports: protectedProcedure
    .input(z.object({ status: z.enum(["pending", "resolved", "dismissed"]).default("pending") }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admins only." });
      return db.listReports(input.status);
    }),

  resolveReport: protectedProcedure
    .input(z.object({ id: z.number().int(), status: z.enum(["resolved", "dismissed"]) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admins only." });
      return db.resolveReport(input.id, input.status);
    }),

  reportTarget: protectedProcedure
    .input(z.object({ targetType: z.enum(["job", "profile"]), targetId: z.number().int(), reason: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => db.createReport(input.targetType, input.targetId, ctx.user.id, input.reason)),
});
