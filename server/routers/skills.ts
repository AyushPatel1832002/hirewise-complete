import { z } from "zod";
import * as db from "../db";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const skillsRouter = router({
  stats: publicProcedure.query(async () => {
    const dbi = await getDb();
    if (!dbi) return { candidates: 5100, jobs: 2100, applications: 22000, skills: 439 };
    const count = async (t: string) => {
      const [rows] = await dbi.execute(`SELECT COUNT(*) AS n FROM ${t}`) as unknown as [{ n: number }[], unknown];
      return rows[0]?.n ?? 0;
    };
    const [candidates, jobs, applications, skills] = await Promise.all([
      count("candidateProfiles"),
      count("jobs"),
      count("applications"),
      count("skills"),
    ]);
    return { candidates, jobs, applications, skills };
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

  // Resolved canonical names for search terms (alias breadcrumbs)
  namesByIds: publicProcedure
    .input(z.object({ ids: z.array(z.number().int()).max(50) }))
    .query(async ({ input }) => {
      if (input.ids.length === 0) return [];
      const dbi = await getDb();
      if (!dbi) return [];
      const [rows] = await dbi.execute(`SELECT id, name, slug FROM skills WHERE id IN (${input.ids.join(",")})`) as unknown as [{ id: number; name: string; slug: string }[], unknown];
      return rows;
    }),
});
