import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const jobsRouter = router({
  browse: publicProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(20),
      query: z.string().max(200).optional(),
      locationId: z.number().int().optional(),
      remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
      seniority: z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
      minSalary: z.number().int().optional(),
      maxSalary: z.number().int().optional(),
    }))
    .query(async ({ input }) => db.getPublishedJobs(input)),

  /** Alias-aware ranked search: weighted text + skills + distance + recency + salary, with explainable scores. */
  ranked: publicProcedure
    .input(z.object({
      query: z.string().max(200).optional(),
      locationId: z.number().int().optional(),
      remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
      seniority: z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
      minSalary: z.number().int().optional(),
      maxSalary: z.number().int().optional(),
      candidateLat: z.number().optional(),
      candidateLng: z.number().optional(),
      cursor: z.tuple([z.number(), z.number()]).nullable().default(null),
      pageSize: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      let skillIds: number[] = [];
      if (input.query) {
        const resolved = await db.resolveSkillIdsByQuery(input.query);
        skillIds = Array.from(resolved);
      }
      return db.rankedSearchJobs({ ...input, skillIds });
    }),

  facetCounts: publicProcedure
    .input(z.object({
      query: z.string().max(200).optional(),
      /** Active filters from OTHER dimensions — each facet is counted with its own dimension excluded. */
      remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
      seniority: z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
      minSalary: z.number().int().optional(),
      maxSalary: z.number().int().optional(),
    }))
    .query(async ({ input }) => {
      let skillIds: number[] = [];
      if (input.query) {
        const resolved = await db.resolveSkillIdsByQuery(input.query);
        skillIds = Array.from(resolved);
      }
      return db.facetCountsForJobs({ ...input, skillIds });
    }),

  detail: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(({ input }) => db.getJobById(input.id)),

  locations: publicProcedure.query(() => db.listLocations()),
});

export const applicationsRouter = router({
  submitApplication: protectedProcedure
    .input(z.object({
      jobId: z.number().int(),
      coverNote: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Create your candidate profile before applying to jobs.",
        });
      }
      const job = await db.getJobById(input.jobId);
      if (!job || !job.published) {
        throw new TRPCError({ code: "NOT_FOUND", message: "This job is not accepting applications." });
      }
      return db.applyToJob(input.jobId, profile.id, input.coverNote);
    }),

  myApplications: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return db.getMyApplications(profile.id);
  }),

  hasApplied: protectedProcedure
    .input(z.object({ jobId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) return { applied: false };
      const dbi = await db.getDb();
      if (!dbi) return { applied: false };
      const { eq, and } = await import("drizzle-orm");
      const { applications } = await import("../../drizzle/schema");
      const rows = await dbi
        .select()
        .from(applications)
        .where(and(eq(applications.jobId, input.jobId), eq(applications.profileId, profile.id)))
        .limit(1);
      return { applied: rows.length > 0, status: rows[0]?.status ?? null };
    }),
});

/**
 * Employer: candidates ranked against a job's skill requirements using the same
 * weights as the public search engine (spillover search).
 */
export const candidateSearchRouter = router({
  run: protectedProcedure
    .input(z.object({
      jobId: z.number().int(),
      skillIds: z.array(z.number().int()).optional(),
      locationId: z.number().int().optional(),
      remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
      pageSize: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const job = await db.getJobById(input.jobId);
      if (!job || !job.published) throw new TRPCError({ code: "NOT_FOUND", message: "Job not published." });
      let skillIds = input.skillIds;
      if (!skillIds) {
        const rows = await db.getJobSkills(input.jobId);
        skillIds = rows.map((r: any) => r.skillId);
      }
      return db.rankedSearchCandidates({ ...input, jobId: input.jobId, skillIds });
    }),
});

/** Named, persisted searches the candidate can re-run (and digest against). */
export const savedSearchesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => db.listSavedSearches(ctx.user.id)),

  save: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(120),
      query: z.object({
        query: z.string().max(200).optional(),
        remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).optional(),
        seniority: z.enum(["junior", "mid", "senior", "lead", "staff"]).optional(),
        minSalary: z.number().int().optional(),
        maxSalary: z.number().int().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createSavedSearch(ctx.user.id, input.name, input.query);
      if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not save search." });
      return { id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const ok = await db.deleteSavedSearch(input.id, ctx.user.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "Saved search not found." });
      return { deleted: true };
    }),

  /** Re-run a saved search against the ranked engine. */
  run: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const rows = await db.listSavedSearches(ctx.user.id);
      const saved = rows.find((s: any) => s.id === input.id);
      if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "Saved search not found." });
      const q = (saved.query ?? {}) as Record<string, unknown>;
      const result = await db.rankedSearchJobs({
        query: typeof q.query === "string" ? q.query : undefined,
        remotePolicy: typeof q.remotePolicy === "string" ? q.remotePolicy : undefined,
        seniority: typeof q.seniority === "string" ? q.seniority : undefined,
        minSalary: typeof q.minSalary === "number" ? q.minSalary : undefined,
        maxSalary: typeof q.maxSalary === "number" ? q.maxSalary : undefined,
        pageSize: 20,
      });
      return { saved, ...result };
    }),
});

