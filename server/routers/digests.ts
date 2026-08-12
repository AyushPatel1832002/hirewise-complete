import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const digestEventTypes = [
  "application.new",
  "application.stage_changed",
  "application.message",
  "profile.viewed",
] as const;

/**
 * Enqueue all pending digest runs (daily/weekly) and return a summary.
 * Publicly callable by the scheduled worker (Heartbeat cron). Runs are
 * transactional-safe because each saved search has exactly one open run.
 */
export const digestsRouter = router({
  runScheduled: publicProcedure.mutation(async () => {
    const results = await db.runAllScheduledDigests();
    return {
      runsCompleted: results.completed,
      jobsEnqueued: results.jobsEnqueued,
      errors: results.errors,
    };
  }),

  myRuns: protectedProcedure.query(async ({ ctx }) => db.listDigestRuns(ctx.user.id)),

  /** Admin ops view: queue depth, failure rate, DLQ. */
  queueStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admins only." });
    return db.getQueueStats();
  }),

  deadLetters: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admins only." });
      return db.listDeadQueueRows(input.limit);
    }),
});
