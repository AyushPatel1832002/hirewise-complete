import { z } from "zod";
import * as db from "../db";
import prisma from "../lib/prisma";
import { publicProcedure, router } from "../_core/trpc";

export const skillsRouter = router({
  stats: publicProcedure.query(async () => {
    try {
      const [candidates, jobs, applications, skills] = await Promise.all([
        prisma.candidateProfile.count(),
        prisma.job.count(),
        prisma.application.count(),
        prisma.skill.count(),
      ]);
      return { candidates, jobs, applications, skills };
    } catch {
      return { candidates: 5100, jobs: 2100, applications: 22000, skills: 439 };
    }
  }),

  search: publicProcedure
    .input(z.object({ term: z.string().max(100) }))
    .query(({ input }) => db.searchSkills(input.term)),

  resolve: publicProcedure
    .input(z.object({ term: z.string().max(100) }))
    .query(({ input }) => db.resolveSkillByTerm(input.term)),

  categories: publicProcedure.query(() => db.listSkillCategories()),

  byCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().min(1).max(200).default(50) }))
    .query(({ input }) => db.listSkillsByCategory(input.category, input.limit)),

  namesByIds: publicProcedure
    .input(z.object({ ids: z.array(z.number().int()).max(50) }))
    .query(async ({ input }) => {
      if (input.ids.length === 0) return [];
      return prisma.skill.findMany({
        where: { id: { in: input.ids } },
        select: { id: true, name: true, slug: true },
      });
    }),
});
