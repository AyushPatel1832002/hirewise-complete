import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

const jobInput = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(50).max(10000),
  seniority: z.enum(["junior", "mid", "senior", "lead", "staff"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]).default("full-time"),
  salaryMin: z.number().min(0).nullable(),
  salaryMax: z.number().min(0).nullable(),
  locationId: z.number().int().nullable(),
  remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]),
  skills: z.array(z.object({
    skillId: z.number().int(),
    weight: z.enum(["required", "preferred"]),
  })).min(1).max(25),
  published: z.boolean().default(false),
});

async function requireCompanyMembership(ctx: any) {
  const membership = await db.getMyCompanyMembership(ctx.user.id);
  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of any company. Create a company profile first." });
  }
  return membership;
}

export const employerRouter = router({
  // ---- Company ----
  getCompany: publicProcedure
    .input(z.object({ companyId: z.number().int() }))
    .query(async ({ input }) => {
      const company = await db.getCompanyById(input.companyId);
      if (!company) throw new TRPCError({ code: "NOT_FOUND", message: "Company not found." });
      const loc = company.locationId ? await db.getLocationById(company.locationId) : null;
      return { ...company, location: loc ?? null };
    }),

  companyJobs: publicProcedure
    .input(z.object({ companyId: z.number().int() }))
    .query(async ({ input }) => {
      return db.getCompanyPublishedJobs(input.companyId);
    }),

  myCompany: protectedProcedure.query(async ({ ctx }) => {
    const companies = await db.getUserCompanies(ctx.user.id);
    const membership = await db.getMyCompanyMembership(ctx.user.id);
    return { companies, membership };
  }),

  createCompany: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(160),
      description: z.string().max(5000).nullable(),
      industry: z.string().max(100).nullable(),
      website: z.string().max(320).nullable(),
      size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable(),
      locationId: z.number().int().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createCompany(input, ctx.user.id);
    }),

  updateCompany: protectedProcedure
    .input(z.object({
      companyId: z.number().int(),
      name: z.string().min(2).max(160).optional(),
      description: z.string().max(5000).nullable().optional(),
      industry: z.string().max(100).nullable().optional(),
      website: z.string().max(320).nullable().optional(),
      size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable().optional(),
      locationId: z.number().int().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      if (membership.companyId !== input.companyId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized for this company." });
      }
      const dbi = await (await import("../db")).getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { companies, eq } = { ...(await import("../../drizzle/schema")), eq: (await import("drizzle-orm")).eq };
      await dbi.update(companies).set(input).where(eq(companies.id, input.companyId));
      return { ok: true };
    }),

  // ---- Jobs ----
  createJob: protectedProcedure
    .input(jobInput)
    .mutation(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      if (input.salaryMin != null && input.salaryMax != null && input.salaryMin > input.salaryMax) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot exceed maximum salary." });
      }
      return db.createJob({
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
        published: input.published,
      });
    }),

  myJobs: protectedProcedure.query(async ({ ctx }) => {
    const membership = await requireCompanyMembership(ctx);
    return db.getCompanyJobs(membership.companyId);
  }),

  getJob: protectedProcedure
    .input(z.object({ jobId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      const job = await db.getJobById(input.jobId);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found." });
      if (job.companyId !== membership.companyId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
      }
      return job;
    }),

  updateJob: protectedProcedure
    .input(jobInput.extend({ jobId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      const job = await db.getJobById(input.jobId);
      if (!job || job.companyId !== membership.companyId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
      }
      if (input.salaryMin != null && input.salaryMax != null && input.salaryMin > input.salaryMax) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot exceed maximum salary." });
      }
      await db.updateJob(input.jobId, {
        title: input.title,
        description: input.description,
        seniority: input.seniority,
        employmentType: input.employmentType,
        salaryMin: input.salaryMin != null ? String(input.salaryMin) : null,
        salaryMax: input.salaryMax != null ? String(input.salaryMax) : null,
        locationId: input.locationId ?? null,
        remotePolicy: input.remotePolicy,
        skills: input.skills,
      });
      return { ok: true };
    }),

  setPublished: protectedProcedure
    .input(z.object({ jobId: z.number().int(), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      const job = await db.getJobById(input.jobId);
      if (!job || job.companyId !== membership.companyId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
      }
      return db.updateJobPublishState(input.jobId, input.published);
    }),

  deleteJob: protectedProcedure
    .input(z.object({ jobId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      const job = await db.getJobById(input.jobId);
      if (!job || job.companyId !== membership.companyId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
      }
      await db.deleteJob(input.jobId);
      return { ok: true };
    }),

  // ---- Applications review ----
  jobApplications: protectedProcedure
    .input(z.object({ jobId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const membership = await requireCompanyMembership(ctx);
      const job = await db.getJobById(input.jobId);
      if (!job || job.companyId !== membership.companyId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized." });
      }
      return db.getJobApplications(input.jobId);
    }),

  setApplicationStatus: protectedProcedure
    .input(z.object({
      applicationId: z.number().int(),
      status: z.enum(["applied", "screening", "interview", "offered", "accepted", "rejected", "withdrawn"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireCompanyMembership(ctx);
      return db.updateApplicationStatus(input.applicationId, input.status);
    }),
});
