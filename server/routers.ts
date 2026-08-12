import { COOKIE_NAME } from "@shared/const";
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
