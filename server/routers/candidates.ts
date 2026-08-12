import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { getDb } from "../db";
import type { CandidateProfile } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

// ---------------------------------------------------------------------------
// Completeness model
// ---------------------------------------------------------------------------
export type ProfileSnapshot = {
  profile: CandidateProfile | null;
  skills: any[];
  workHistory: any[];
  education: any[];
};

export type CompletenessBreakdown = {
  score: number; // 0-100
  sections: {
    key: string;
    label: string;
    weight: number;
    done: boolean;
  }[];
};

export function computeCompleteness(s: ProfileSnapshot): CompletenessBreakdown {
  const p = s.profile;
  const sections = [
    { key: "basics", label: "Headline & summary", weight: 20, done: !!(p?.headline && p?.headline.trim().length >= 5 && p?.summary && p.summary.trim().length >= 30) },
    { key: "title", label: "Current role & experience", weight: 15, done: !!(p?.currentTitle?.trim() && p?.yearsOfExperience != null && (p?.yearsOfExperience ?? 0) >= 0) },
    { key: "location", label: "Location & work policy", weight: 10, done: !!(p?.locationId && p?.remotePolicy) },
    { key: "skills", label: "Skills (at least 3)", weight: 20, done: (s.skills?.length ?? 0) >= 3 },
    { key: "work", label: "Work history (at least 1)", weight: 20, done: (s.workHistory?.length ?? 0) >= 1 },
    { key: "education", label: "Education (at least 1)", weight: 10, done: (s.education?.length ?? 0) >= 1 },
    { key: "salary", label: "Desired salary range", weight: 5, done: !!(p?.desiredSalaryMin && p?.desiredSalaryMax) },
  ];
  const score = Math.round(
    sections.reduce((acc, s2) => acc + (s2.done ? s2.weight : 0), 0),
  );
  return { score, sections };
}

// ---------------------------------------------------------------------------
// Resume parsing: server-side extraction only, results become suggestions
// ---------------------------------------------------------------------------
type ParsedSuggestion = { kind: "workExperience" | "education" | "skill"; data: Record<string, unknown> };

function parseResumeText(text: string): ParsedSuggestion[] {
  const suggestions: ParsedSuggestion[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // --- Work experience heuristics ---
  // Lines like "Senior Engineer, Acme Corp, 2020 - 2023" or
  // "Software Engineer — Google (2018–2021)"
  const expPatterns = [
    /^(.+?),\s*([A-Z][A-Za-z0-9 &\.\-]+(?:Co|Inc|LLC|Corp|Ltd|GmbH|SAS)?\.?),?\s*(\d{4})\s*[-–to]+\s*(Present|now|20\d\d|19\d\d)/i,
    /^(.+?)\s*[-—–]\s*([A-Z][A-Za-z0-9 &\.\-]+(?:Co|Inc|LLC|Corp|Ltd|GmbH|SAS)?\.?)\s*\((\d{4})\s*[-–to]+\s*(Present|now|20\d\d|19\d\d)\)/i,
    /^(.+?)\s+at\s+([A-Z][A-Za-z0-9 &\.\-]+(?:Co|Inc|LLC|Corp|Ltd|GmbH|SAS)?\.?)\s*[-–—]?\s*(\d{4})\s*[-–to]+\s*(Present|now|20\d\d|19\d\d)/i,
  ];
  for (const line of lines) {
    for (const re of expPatterns) {
      const m = line.match(re);
      if (m) {
        const [_, title, company, start, end] = m;
        const endYear = /present|now/i.test(end ?? "") ? null : parseInt(end as string, 10);
        if (title && title.length > 2 && title.length < 80 && company && company.length > 1) {
          suggestions.push({
            kind: "workExperience",
            data: {
              title: title.trim(),
              company: company.trim(),
              startDate: `${start}-01-01`,
              endDate: endYear ? `${endYear}-12-31` : null,
              current: /present|now/i.test(end ?? ""),
              description: null,
            },
          });
        }
        break;
      }
    }
  }

  // --- Education heuristics ---
  const eduPatterns = [
    /^(B(?:achelor)?(?:'s)?|M(?:aster)?(?:'s)?|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|MBA|Ph\.?D\.?)[\.\s]+(?:of\s+)?(?:in\s+)?(.+?)\s*[,\-—–]?\s*(.+?)\s*[,\-—–]?\s*(\d{4})/,
    /^(.+?)\s*,\s*((?:B(?:achelor)?(?:'s)?|M(?:aster)?(?:'s)?|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|MBA|Ph\.?D\.?)[\.\s]+(?:of\s+)?(?:in\s+)?(?:.+?))\s*[,\-—–]?\s*(\d{4})/,
  ];
  for (const line of lines) {
    for (const re of eduPatterns) {
      const m = line.match(re);
      if (m && m.length >= 5) {
        const [_, d1, d2, d3, d4] = m;
        const degree = d1.length < 40 ? d1 : d2 ?? d1;
        const institution = /university|college|institute|school/i.test(line)
          ? line.match(/([A-Z][A-Za-z0-9 &\.\-]+(?:University|College|Institute|School))/)?.[1] ?? d3 ?? "Unknown"
          : d3 ?? "Unknown";
        if (degree && institution) {
          suggestions.push({
            kind: "education",
            data: {
              institution: institution.trim(),
              degree: degree.trim(),
              fieldOfStudy: null,
              startYear: parseInt(d4 ?? "", 10) - 4 || null,
              endYear: parseInt(d4 ?? "", 10) || null,
            },
          });
        }
        break;
      }
    }
  }

  // --- Skill heuristics: intersect against the controlled taxonomy ---
  const lower = text.toLowerCase();
  // candidate skills are resolved from taxonomy slugs/names only (controlled vocabulary)
  return suggestions;
}

export async function resolveSuggestedSkills(text: string): Promise<ParsedSuggestion[]> {
  const existing = await parseResumeText(text);
  const lower = text.toLowerCase();
  const skillOut: ParsedSuggestion[] = [];
  // Intersect taxonomy names/slugs found in the text, weighted by proximity to role context.
  const allSkills = await db.searchSkills(""); // too broad — instead sample by token presence
  // Pragmatic approach: build a token map of taxonomy terms present in text.
  // We query candidate-relevant skills via a full-text-ish scan: fetch all skills
  // whose name appears verbatim in the lowercased text.
  const dbi = await getDb();
  if (!dbi) return existing;
  const [skills] = await dbi.execute(`SELECT id, name, slug FROM skills`) as unknown as [{ id: number; name: string; slug: string }[], unknown];
  const rows = skills;
  const seen = new Set<number>();
  for (const skill of rows) {
    const tokens = skill.name.toLowerCase().split(/[\s\/\.\-]+/);
    // require every token (>=3 chars) to appear in text to count as a match
    if (tokens.every((t) => t.length >= 3 && lower.includes(t)) && !seen.has(skill.id)) {
      seen.add(skill.id);
      skillOut.push({ kind: "skill", data: { name: skill.name, proficiency: "intermediate", years: 0 } });
    }
  }
  return [...existing, ...skillOut.slice(0, 40)];
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const candidateRouter = router({
  // ---- Profile snapshot + completeness (live, read-only) ----
  snapshot: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const profile = await db.getCandidateProfileByUserId(userId);
    const profileId = profile?.id ?? 0;
    const [skills, workHistory, education] = profileId
      ? await Promise.all([
          db.listCandidateSkills(profileId),
          db.listWorkExperiences(profileId),
          db.listEducation(profileId),
        ])
      : [[], [], []];
    return { profile, skills, workHistory, education, completeness: computeCompleteness({ profile, skills, workHistory, education }) };
  }),

  // ---- Draft persistence: each step is saved server-side immediately ----
  getDraft: protectedProcedure.query(({ ctx }) => db.getProfileDraft(ctx.user.id)),

  saveStep: protectedProcedure
    .input(z.object({
      step: z.number().int().min(0).max(5),
      data: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      const draft = await db.getProfileDraft(ctx.user.id);
      const merged = { ...(draft?.stepData ?? {}), ...input.data } as Record<string, unknown>;
      return db.saveProfileDraft(ctx.user.id, input.step, merged);
    }),

  clearDraft: protectedProcedure.mutation(async ({ ctx }) => {
    await db.clearProfileDraft(ctx.user.id);
    return { cleared: true };
  }),

  // ---- Step 0: basics ----
  saveBasics: protectedProcedure
    .input(z.object({
      headline: z.string().max(160).nullable(),
      summary: z.string().max(5000).nullable(),
      currentTitle: z.string().max(120).nullable(),
      yearsOfExperience: z.number().int().min(0).max(50).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.upsertCandidateProfile(ctx.user.id, {
        headline: input.headline ?? null,
        summary: input.summary ?? null,
        currentTitle: input.currentTitle ?? null,
        yearsOfExperience: input.yearsOfExperience ?? null,
      });
    }),

  // ---- Step 1: location & preferences ----
  savePreferences: protectedProcedure
    .input(z.object({
      locationId: z.number().int().nullable(),
      remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).nullable(),
      desiredSalaryMin: z.number().min(0).nullable(),
      desiredSalaryMax: z.number().min(0).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.upsertCandidateProfile(ctx.user.id, {
        locationId: input.locationId ?? null,
        remotePolicy: input.remotePolicy ?? null,
        desiredSalaryMin: input.desiredSalaryMin != null ? String(input.desiredSalaryMin) : null,
        desiredSalaryMax: input.desiredSalaryMax != null ? String(input.desiredSalaryMax) : null,
      });
    }),

  // ---- Step 2: skills ----
  addSkill: protectedProcedure
    .input(z.object({
      skillId: z.number().int(),
      proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      years: z.number().int().min(0).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Create your profile first (save basics)." });
      const dbi = await getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { and, eq } = await import("drizzle-orm");
      const { candidateSkills } = await import("../../drizzle/schema");
      const existing = await dbi.select().from(candidateSkills)
        .where(and(eq(candidateSkills.profileId, profile.id), eq(candidateSkills.skillId, input.skillId)))
        .limit(1);
      if (existing.length > 0) {
        await dbi.update(candidateSkills)
          .set({ proficiency: input.proficiency, years: input.years })
          .where(eq(candidateSkills.id, existing[0].id));
      } else {
        await dbi.insert(candidateSkills).values([{
          profileId: profile.id,
          skillId: input.skillId,
          proficiency: input.proficiency,
          years: input.years,
        }]);
      }
      return { ok: true };
    }),

  removeSkill: protectedProcedure
    .input(z.object({ skillId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "No profile" });
      const dbi = await getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { and, eq } = await import("drizzle-orm");
      const { candidateSkills } = await import("../../drizzle/schema");
      await dbi.delete(candidateSkills).where(and(eq(candidateSkills.profileId, profile.id), eq(candidateSkills.skillId, input.skillId)));
      return { ok: true };
    }),

  listSkills: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return db.listCandidateSkills(profile.id);
  }),

  // ---- Step 3: work experience ----
  addWorkExperience: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(160),
      company: z.string().min(1).max(160),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      current: z.boolean().default(false),
      description: z.string().max(5000).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Create your profile first." });
      const dbi = await getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { workExperiences } = await import("../../drizzle/schema");
      await dbi.insert(workExperiences).values([{
        profileId: profile.id,
        title: input.title,
        company: input.company,
        startDate: input.startDate ? new Date(input.startDate + "T00:00:00Z") : null,
        endDate: input.endDate ? new Date(input.endDate + "T00:00:00Z") : null,
        current: input.current,
        description: input.description ?? null,
      }]);
      return { ok: true };
    }),

  removeWorkExperience: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "No profile" });
      const dbi = await getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { and, eq } = await import("drizzle-orm");
      const { workExperiences } = await import("../../drizzle/schema");
      await dbi.delete(workExperiences).where(and(eq(workExperiences.profileId, profile.id), eq(workExperiences.id, input.id)));
      return { ok: true };
    }),

  listWorkHistory: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return db.listWorkExperiences(profile.id);
  }),

  // ---- Step 4: education ----
  addEducation: protectedProcedure
    .input(z.object({
      institution: z.string().min(1).max(200),
      degree: z.string().min(1).max(160),
      fieldOfStudy: z.string().max(160).nullable(),
      startYear: z.number().int().min(1950).max(2030).nullable(),
      endYear: z.number().int().min(1950).max(2030).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Create your profile first." });
      const dbi = await getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { education } = await import("../../drizzle/schema");
      await dbi.insert(education).values([{
        profileId: profile.id,
        institution: input.institution,
        degree: input.degree,
        fieldOfStudy: input.fieldOfStudy ?? null,
        startYear: input.startYear ?? null,
        endYear: input.endYear ?? null,
      }]);
      return { ok: true };
    }),

  removeEducation: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "No profile" });
      const dbi = await getDb();
      if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { and, eq } = await import("drizzle-orm");
      const { education } = await import("../../drizzle/schema");
      await dbi.delete(education).where(and(eq(education.profileId, profile.id), eq(education.id, input.id)));
      return { ok: true };
    }),

  listEducation: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return db.listEducation(profile.id);
  }),

  // ---- Resume upload: extract + parse, return SUGGESTIONS only ----
  uploadResume: protectedProcedure
    .input(z.object({
      fileName: z.string().max(255),
      bytesBase64: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      const profileId = profile?.id ?? 0;
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Save your basics before uploading a resume." });

      const bytes = Buffer.from(input.bytesBase64, "base64");
      if (bytes.length > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Resume too large (max 10MB)." });
      }
      // Store original PDF in S3
      const relKey = `resumes/${profileId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { url } = await storagePut(relKey, bytes, "application/pdf");

      // Server-side text extraction (never silently writes to the profile)
      let text = "";
      try {
        // pdfjs-dist must be loaded server-side; dynamic import keeps it out of the client bundle
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
        const doc = await pdfjsLib.getDocument({ data: bytes, useSystemFonts: false }).promise;
        const parts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          parts.push(content.items.map((it: any) => it.str ?? "").join(" "));
        }
        text = parts.join("\n").replace(/\s{2,}/g, " ");
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not extract text from this PDF. It may be scanned/image-based. Please fill in your profile manually.",
        });
      }

      if (text.trim().length < 50) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Very little text was found in this PDF (it may be an image scan). Please fill in your profile manually.",
        });
      }

      // Parse into structured suggestions — these MUST be confirmed by the candidate
      const suggestions = await resolveSuggestedSkills(text);

      // Save suggestions as pending (status='pending'); nothing touches the profile yet
      if (suggestions.length > 0) {
        await db.createResumeSuggestions(
          profileId,
          suggestions.map((s) => ({ kind: s.kind, data: s.data })),
        );
      }

      return {
        resumeUrl: url,
        resumeFileName: input.fileName,
        extractedTextLength: text.length,
        suggestionCount: suggestions.length,
      };
    }),

  listSuggestions: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return [];
    return db.listResumeSuggestions(profile.id);
  }),

  decideSuggestion: protectedProcedure
    .input(z.object({
      suggestionId: z.number().int(),
      decision: z.enum(["confirm", "reject"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.getCandidateProfileByUserId(ctx.user.id);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "No profile" });

      const suggestions = await db.listResumeSuggestions(profile.id);
      const suggestion = suggestions.find((s) => s.id === input.suggestionId && s.profileId === profile.id);
      if (!suggestion) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Suggestion not found." });
      }
      if (suggestion.status !== "pending") {
        throw new TRPCError({ code: "CONFLICT", message: "This suggestion was already decided." });
      }

      // Record the candidate's explicit decision
      const updated = await db.updateResumeSuggestionStatus(
        suggestion.id,
        input.decision === "confirm" ? "confirmed" : "rejected",
      );

      // Only a CONFIRMED suggestion may ever touch the profile
      if (updated.status === "confirmed") {
        await db.applyConfirmedSuggestion(updated);
      }
      return { ok: true, status: updated.status };
    }),

  discardSuggestions: protectedProcedure.mutation(async ({ ctx }) => {
    const profile = await db.getCandidateProfileByUserId(ctx.user.id);
    if (!profile) return { discarded: 0 };
    const dbi = await getDb();
    if (!dbi) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { resumeSuggestions, eq } = { ...(await import("../../drizzle/schema")), eq: (await import("drizzle-orm")).eq };
    const pending = await dbi.select().from(resumeSuggestions).where(eq(resumeSuggestions.profileId, profile.id));
    for (const s of pending) {
      if (s.status === "pending") {
        await dbi.update(resumeSuggestions).set({ status: "rejected" }).where(eq(resumeSuggestions.id, s.id));
      }
    }
    return { discarded: pending.length };
  }),
});
