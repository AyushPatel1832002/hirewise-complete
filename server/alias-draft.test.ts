import { skipIfNoDb } from "./testSetup";
import { describe, expect, it } from "vitest";
import {
  resolveSkillByTerm,
  resolveSkillIdsByQuery,
  saveProfileDraft,
  getProfileDraft,
  clearProfileDraft,
} from "./db";
import { computeCompleteness, type ProfileSnapshot } from "./routers/candidates";

describe("alias resolution (query time, never at write time)", () => {
  if (skipIfNoDb("alias resolution (query time, never at write time)")) { it.skip("no DB available", () => {}); return; }
  it("resolves 'js', 'Javascript', 'JavaScript' to the same canonical skill", async () => {
    const r1 = await resolveSkillByTerm("js");
    const r2 = await resolveSkillByTerm("Javascript");
    const r3 = await resolveSkillByTerm("JavaScript");
    expect(r1).not.toBeNull();
    expect(r1!.id).toBe(r2!.id);
    expect(r2!.id).toBe(r3!.id);
    expect(r3!.name).toBe("JavaScript");
  });

  it("multi-term query unions resolved skill ids", async () => {
    const js = (await resolveSkillByTerm("js"))!;
    const ids = await resolveSkillIdsByQuery("js frontend");
    expect(ids).toContain(js.id);
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });

  it("returns null for unknown terms", async () => {
    expect(await resolveSkillByTerm("zzznonexistent999")).toBeNull();
  });

  it("canonical name still resolves directly", async () => {
    const py = await resolveSkillByTerm("python");
    expect(py).not.toBeNull();
    expect(py!.name).toBe("Python");
  });
});

describe("computeCompleteness", () => {
  const empty: ProfileSnapshot = { profile: null, skills: [], workHistory: [], education: [] };

  it("scores 0 for an empty snapshot", () => {
    expect(computeCompleteness(empty).score).toBe(0);
  });

  it("scores 100 when all sections are done", () => {
    const full: ProfileSnapshot = {
      profile: {
        headline: "Senior Engineer",
        summary: "This is a summary that is definitely long enough to count",
        currentTitle: "Engineer",
        yearsOfExperience: 5,
        locationId: 1,
        remotePolicy: "hybrid",
        desiredSalaryMin: 100,
        desiredSalaryMax: 150,
      } as any,
      skills: [1, 2, 3],
      workHistory: [1],
      education: [1],
    };
    expect(computeCompleteness(full).score).toBe(100);
  });

  it("marks skills section done only at 3+ skills", () => {
    const s = computeCompleteness({ ...empty, skills: [1, 2] });
    expect(s.sections.find((x) => x.key === "skills")!.done).toBe(false);
    const s2 = computeCompleteness({ ...empty, skills: [1, 2, 3] });
    expect(s2.sections.find((x) => x.key === "skills")!.done).toBe(true);
  });
});

describe("draft persistence (server-side, per step)", () => {
  if (skipIfNoDb("draft persistence (server-side, per step)")) { it.skip("no DB available", () => {}); return; }
  const userId = 999999; // dedicated test user id that must not exist in the seed

  it("persists a step and restores it by user id", async () => {
    await saveProfileDraft(userId, 3, { skillIds: [14, 46], experience: { title: "Dev", years: 3 } });
    const draft = await getProfileDraft(userId);
    expect(draft).not.toBeNull();
    expect(draft!.currentStep).toBe(3);
    expect((draft!.stepData as any).skillIds).toEqual([14, 46]);
    await clearProfileDraft(userId);
    expect(await getProfileDraft(userId)).toBeNull();
  });

  it("later steps overwrite earlier ones under the same user", async () => {
    await saveProfileDraft(userId, 1, { basics: { a: 1 } });
    await saveProfileDraft(userId, 4, { experience: { b: 2 } });
    const draft = await getProfileDraft(userId);
    expect(draft!.currentStep).toBe(4);
    await clearProfileDraft(userId);
  });
});
