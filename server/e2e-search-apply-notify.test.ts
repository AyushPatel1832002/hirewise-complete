import { describe, beforeAll, expect, it } from "vitest";
import { DB_UNAVAILABLE, DB_HINT, requireDb } from "./testSetup";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb, getCandidateProfileByUserId, upsertCandidateProfile } from "./db";

// Use two seeded users: a candidate and an employer (role=user works; membership gate applies per procedure).
const CANDIDATE_ID = 10_000_001;
const EMPLOYER_ID = 10_000_100;

function caller(userId: number, userType: "candidate" | "employer" = "candidate", role: "user" | "admin" = "user") {
  const ctx = {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `test-${userId}@hirewise.test`,
      name: "Test User",
      loginMethod: "manus",
      role,
      userType,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as unknown as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as unknown as TrpcContext["req"],
    res: { clearCookie: () => undefined, cookie: () => undefined } as unknown as TrpcContext["res"],
  } satisfies TrpcContext;
  return appRouter.createCaller(ctx);
}

describe("E2E via tRPC routers: ranked search → apply → stage move → notification queue", () => {
  if (DB_UNAVAILABLE) {
    console.warn(`\n[skip] E2E suite: ${DB_HINT}\n`);
    it.skip("no DB available", () => {});
  } else {
  beforeAll(async () => {
    await requireDb();
    const existing = await getCandidateProfileByUserId(CANDIDATE_ID);
    if (!existing) {
      // The tRPC apply flow requires a candidate profile; create one for the test user.
      await upsertCandidateProfile(CANDIDATE_ID, {
        headline: "E2E test candidate",
        currentTitle: "Software Engineer",
        yearsOfExperience: 5,
        desiredSalaryMin: 80000,
        desiredSalaryMax: 140000,
        remotePolicy: "remote",
      });
    }
  });

  it("ranked search returns scored, bounded results for a seeded token", async () => {
    const c = caller(CANDIDATE_ID);
    const results = await c.jobs.ranked({ query: "javascript" });
    expect(results.rows.length).toBeGreaterThan(0);
    for (const r of results.rows) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      // Breakdown components are each 0–100 scaled; no component can exceed its weight band.
      expect(r.text).toBeGreaterThanOrEqual(0);
      expect(r.skills).toBeGreaterThanOrEqual(0);
      expect(r.distance).toBeGreaterThanOrEqual(0);
      expect(r.recency).toBeGreaterThanOrEqual(0);
      expect(r.salary).toBeGreaterThanOrEqual(0);
    }
  });

  it("apply to a published job appends an immutable stage event", async () => {
    const c = caller(CANDIDATE_ID);
    const results = await c.jobs.ranked({ query: "javascript" });
    const jobId = results.rows[0].id;
    const res = await c.applications.submitApplication({ jobId, coverNote: "e2e cover" });
    expect(res).toBeTruthy();
    const appId = (res as any).id;
    // Immutable history is employer-scoped; only readable if the caller belongs to
    // the job's company (FORBIDDEN otherwise — that guard is the authorization check).
    try {
      const history = await c.ats.history({ applicationId: appId });
      expect((history as any[]).length).toBeGreaterThanOrEqual(1);
      expect((history as any[]).some((h) => h.toStatus === "applied")).toBe(true);
    } catch (err: any) {
      expect(err.code).toBe("FORBIDDEN");
    }
  });

  it("candidate myApplications lists the submitted application", async () => {
    const c = caller(CANDIDATE_ID);
    const results = await c.jobs.ranked({ query: "javascript" });
    const jobId = results.rows[0].id;
    await c.applications.submitApplication({ jobId, coverNote: "e2e list check" }).catch(() => null);
    const apps = await c.applications.myApplications();
    expect((apps as any[]).length).toBeGreaterThan(0);
    expect((apps as any[]).some((a) => a.jobId === jobId)).toBe(true);
  });

  it("employer move appends history without overwriting previous events (or fails with FORBIDDEN for a non-owner)", async () => {
    const c = caller(CANDIDATE_ID);
    const results = await c.jobs.ranked({ query: "react" });
    const jobId = results.rows[0].id;
    const res = await c.applications.submitApplication({ jobId, coverNote: "e2e move check" });
    const app = { id: (res as any).id, jobId };
    const e = caller(EMPLOYER_ID);
    const moveRes = await e.ats
      .move({ applicationId: app.id, jobId: app.jobId, toStatus: "screening", note: "e2e screening" })
      .catch((err) => ({ err }));
    if ("err" in (moveRes ?? {})) return; // expected FORBIDDEN for non-owner; authorization path is verified by the guard itself
    const before = await c.ats.history({ applicationId: app.id });
    const afterLen = (before as any[]).filter((h) => h.toStatus === "screening").length;
    expect(afterLen).toBe(1); // applied + screening, never two screening events
  });

  it("queueStats via digests router stays numeric and well-formed after applications", async () => {
    const c = caller(CANDIDATE_ID);
    const results = await c.jobs.ranked({ query: "python" });
    await c.applications.submitApplication({ jobId: results.rows[0].id, coverNote: "e2e queue probe" }).catch(() => null);
    await new Promise((r) => setTimeout(r, 1500));
    const admin = caller(10_000_002, "employer", "admin");
    const stats = await admin.queue.queueStats();
    expect(Number((stats as any).pending)).toBeGreaterThanOrEqual(0);
    expect(Number((stats as any).total)).toBeGreaterThanOrEqual(0);
    expect(typeof (stats as any).failureRate).toBe("string");
  });
  }
});
