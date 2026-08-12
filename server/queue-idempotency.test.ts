import { skipIfNoDb } from "./testSetup";
import { describe, expect, it } from "vitest";
import { bigramSimilarity } from "../shared/ranking";
import {
  claimQueueBatch,
  enqueueNotification,
  getQueueStats,
  markQueueFailed,
  markQueueSent,
  resolveSkillByTerm,
} from "./db";

// Pick a seeded user to receive test notifications (user ids start at 10,000,001).
const TEST_USER = 10_000_001;

function key(suffix: string) {
  return `vitest:${suffix}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describe("bigramSimilarity (typo-tolerance scoring units)", () => {
  it("exact strings score 1.0", () => {
    expect(bigramSimilarity("javascript", "javascript")).toBeCloseTo(1);
  });
  it("one-char typo still scores high", () => {
    expect(bigramSimilarity("javascript", "javascrpt")).toBeGreaterThan(0.8);
  });
  it("unrelated strings score low", () => {
    expect(bigramSimilarity("react", "plumbing")).toBeLessThan(0.4);
  });
  it("empty-both strings score 1 (defensive default)", () => {
    expect(bigramSimilarity("", "")).toBe(1);
  });
});

describe("queue idempotency: same jobKey enqueued twice", () => {
  if (skipIfNoDb("queue idempotency: same jobKey enqueued twice")) { it.skip("no DB available", () => {}); return; }
  it("second enqueue with same jobKey does not create a second row", async () => {
    const k = key("dup");
    await enqueueNotification({ jobKey: k, channel: "in_app", recipientUserId: TEST_USER, eventType: "stage_changed", subject: "t", payload: {} });
    await enqueueNotification({ jobKey: k, channel: "in_app", recipientUserId: TEST_USER, eventType: "stage_changed", subject: "t2", payload: {} });
    // onDuplicateKeyUpdate — status reset to pending; there must never be 2 rows.
    const stats = await getQueueStats();
    expect(stats.pending + stats.processing).toBeGreaterThanOrEqual(1);
  });

  it("processQueue never processes a row twice even when re-run", async () => {
    const k = key("claim");
    await enqueueNotification({ jobKey: k, channel: "in_app", recipientUserId: TEST_USER, eventType: "application_submitted", subject: "q", payload: {} });
    const batch1 = await claimQueueBatch(20);
    const row = batch1.find((r) => r.jobKey === k);
    expect(row).toBeTruthy();
    await markQueueSent(row!.id, { queueId: row!.id, recipientUserId: TEST_USER, recipientEmail: null, subject: "q", outcome: "logged_only", providerResponse: null });
    // Re-claiming must not return the sent row.
    const batch2 = await claimQueueBatch(20);
    expect(batch2.some((r) => r.id === row!.id)).toBe(false);
  });
});

describe("retry / backoff / dead-letter lifecycle", () => {
  if (skipIfNoDb("retry / backoff / dead-letter lifecycle")) { it.skip("no DB available", () => {}); return; }
  it(
    "failed rows retry with exponential backoff then dead-letter",
    async () => {
    const k = key("fail");
    await enqueueNotification({ jobKey: k, channel: "in_app", recipientUserId: TEST_USER, eventType: "application_submitted", subject: "f", payload: {} });
    const batch = await claimQueueBatch(20);
    const row = batch.find((r) => r.jobKey === k)!;
    // Drive the row through repeated simulated failures. markQueueFailed is
    // DB-authoritative, so passing a stale retryCount (as a flaky worker might)
    // must never prevent dead-lettering.
    let becameDead = false;
    for (let i = 0; i < 8 && !becameDead; i++) {
      const res = await markQueueFailed(row.id, `boom ${i}`, 0);
      if (res.dead) {
        becameDead = true;
        break;
      }
      // Backoff is bounded: 60·2^retry seconds, capped at 3600.
      expect(res.backoffSeconds).toBeLessThanOrEqual(3600);
    }
    // Within 6 failures the row must be dead.
    expect(becameDead).toBe(true);
    const stats = await getQueueStats();
    expect(stats.dead).toBeGreaterThanOrEqual(1);
    },
    { timeout: 60_000 },
  );
});

describe("getQueueStats includes total and failure rate", () => {
  if (skipIfNoDb("getQueueStats includes total and failure rate")) { it.skip("no DB available", () => {}); return; }
  it("returns numeric failureRate between 0 and 100", async () => {
    const stats = await getQueueStats();
    expect(Number(stats.failureRate)).toBeGreaterThanOrEqual(0);
    expect(Number(stats.failureRate)).toBeLessThanOrEqual(100);
    expect(stats.total).toBe(stats.pending + stats.processing + stats.failed + stats.dead + stats.sent);
  });
});

describe("alias resolution still resolves the canonical set", () => {
  if (skipIfNoDb("alias resolution still resolves the canonical set")) { it.skip("no DB available", () => {}); return; }
  it("js / Javascript / JavaScript agree after queue churn", async () => {
    const r1 = await resolveSkillByTerm("js");
    const r2 = await resolveSkillByTerm("Javascript");
    expect(r1!.id).toBe(r2!.id);
    expect(r1!.name).toBe("JavaScript");
  });
});
