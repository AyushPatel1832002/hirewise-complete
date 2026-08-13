import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { candidateRouter } from "./routers/candidates";
import { employerRouter } from "./routers/employers";
import { applicationsRouter, candidateSearchRouter, jobsRouter, savedSearchesRouter } from "./routers/jobs";
import { atsRouter } from "./routers/ats";
import { skillsRouter } from "./routers/skills";
import { notificationsRouter } from "./routers/notifications";
import { digestsRouter } from "./routers/digests";
import { queueRouter } from "./routers/queue";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    loginWithGoogle: publicProcedure
      .input(
        z.object({
          email: z.string().optional(),
          name: z.string().optional(),
          userType: z.enum(["candidate", "employer", "both"]).optional(),
        }).optional()
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const email = input?.email?.trim() || "ayush.patel@gmail.com";
          const name = input?.name?.trim() || "Ayush Patel";
          const userType = input?.userType || "candidate";
          const openId = `google_${Buffer.from(email).toString("hex").slice(0, 16)}`;

          await db.upsertUser({
            openId,
            name,
            email,
            loginMethod: "google",
            userType,
            lastSignedIn: new Date(),
          });

          const sessionToken = await sdk.createSessionToken(openId, {
            name,
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

          const user = await db.getUserByOpenId(openId);
          return { success: true, user };
        } catch (error: any) {
          console.error("[Auth] loginWithGoogle failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error?.message || "Failed to sign in with Google",
          });
        }
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
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
  queue: queueRouter,
});

export type AppRouter = typeof appRouter;
