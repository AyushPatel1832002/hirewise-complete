import { skipIfNoDb } from "./testSetup";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { clearProfileDraft, saveProfileDraft, getProfileDraft } from "./db";
import type { TrpcContext } from "./_core/context";

/**
 * End-to-end verification of the candidate draft flow through the real tRPC
 * router: a logged-in candidate saves step data and re-opens the profile
 * builder — the draft must come back exactly as saved, surviving an arbitrary
 * "refresh" (simulated by re-querying getDraft).
 */
const TEST_USER_ID = 800000; // must not collide with seeded user ids (1000000+)

function createCtx(): TrpcContext {
  return {
    user: {
      id: TEST_USER_ID,
      openId: `test-user-${TEST_USER_ID}`,
      email: `test-${TEST_USER_ID}@hirewise.test`,
      name: "Draft Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as unknown as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as unknown as TrpcContext["req"],
    res: { clearCookie: () => undefined, cookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("candidates.getDraft via tRPC router (authenticated)", () => {
  if (skipIfNoDb("candidates.getDraft via tRPC router (authenticated)")) { it.skip("no DB available", () => {}); return; }
  it("round-trips a complete mid-flow draft (refresh mid-flow loses nothing)", async () => {
    await clearProfileDraft(TEST_USER_ID);
    const caller = appRouter.createCaller(createCtx());

    const saved = {
      basics: { headline: "Senior Frontend Engineer", summary: "6 years React expertise.", currentTitle: "Senior Software Engineer", yearsOfExperience: 6 },
      prefs: { locationId: 5, remotePolicy: "hybrid", desiredSalaryMin: 120000, desiredSalaryMax: 160000 },
      skillForm: { skillIds: [14, 46, 105] },
      workForm: { title: "Senior Frontend Engineer", company: "Acme Corp", startYear: 2020, endYear: null },
      eduForm: { school: "State University", degree: "BS", field: "Computer Science", startYear: 2014, endYear: 2018 },
    };

    // Save the draft (simulates the profile builder persisting at step 3)
    await saveProfileDraft(TEST_USER_ID, 3, saved);

    // Simulate refresh: the page re-queries getDraft
    const restored = await caller.candidates.getDraft();
    expect(restored).not.toBeNull();
    expect((restored as any).currentStep).toBe(3);
    expect((restored as any).stepData).toEqual(saved);

    // Verify the DB layer independently
    const dbDraft = await getProfileDraft(TEST_USER_ID);
    expect(dbDraft).not.toBeNull();
    expect(dbDraft!.currentStep).toBe(3);

    await clearProfileDraft(TEST_USER_ID);
    expect(await caller.candidates.getDraft()).toBeNull();
  });
});
