import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

const MAX_RETRIES = 6;

/** Send a single queued notification: resolves recipient email, dispatches via
 *  Resend if RESEND_API_KEY is set, otherwise no-op transport with a logged entry. */
async function dispatchOne(row: any) {
  const payload = (typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload) as Record<string, unknown>;
  let recipientEmail: string | null = null;
  const users = await db.getUsersByIds([row.recipientUserId]);
  recipientEmail = users[0]?.email ?? null;

  let outcome: "sent" | "skipped_no_email" | "transport_error" | "logged_only" = "logged_only";
  let providerResponse: string | null = null;
  try {
    if (!recipientEmail) {
      outcome = "skipped_no_email";
    } else if (process.env.RESEND_API_KEY) {
      const res: Response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "HireWise <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: row.subject ?? "HireWise notification",
          html: emailTemplate(String(row.subject ?? "HireWise notification"), payload),
        }),
      });
      if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
      outcome = "sent";
      providerResponse = `HTTP ${res.status}`;
    } else {
      // No transport configured: log only, never lose the message
      outcome = "logged_only";
      providerResponse = `no-op transport; subject=${row.subject ?? ""}`;
    }
  } catch (e: any) {
    outcome = "transport_error";
    providerResponse = String(e?.message ?? e).slice(0, 500);
    throw e;
  } finally {
    await db.markQueueSent(row.id, {
      queueId: row.id,
      recipientUserId: row.recipientUserId,
      recipientEmail,
      subject: row.subject,
      outcome,
      providerResponse,
    });
  }
}

function emailTemplate(subject: string, payload: Record<string, unknown>): string {
  const rows = Object.entries(payload)
    .slice(0, 8)
    .map(([k, v]) => `<tr><td style=\"padding:4px 8px;border:1px solid #e5e7eb\">${k}</td><td style=\"padding:4px 8px;border:1px solid #e5e7eb\">${String(v)}</td></tr>`)
    .join("");
  return `<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px\">
<h2 style=\"color:#1a2744\">${subject}</h2>
<table cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;width:100%;font-size:14px\">${rows}</table>
<p style=\"margin-top:24px;color:#6b7280;font-size:12px\">HireWise · You can manage these notifications from your notification settings.</p>
</body></html>`;
}

export const queueRouter = router({
  /**
   * Worker entrypoint for the processQueue cron (Heartbeat, every minute):
   * claim → dispatch → sent/failed with exponential backoff → dead-letter.
   * Idempotent: job_key is unique so re-running never duplicates work.
   */
  processQueue: publicProcedure
    .input(z.object({ batchSize: z.number().int().min(1).max(100).default(20) }).optional())
    .mutation(async ({ input }) => {
      const batch = await db.claimQueueBatch(input?.batchSize ?? 20);
      const results: { queueId: number; status: "sent" | "failed" | "dead"; retryCount: number }[] = [];
      db.logEvent("worker_run_start", { batchSize: batch.length });
      for (const row of batch) {
        try {
          await dispatchOne(row);
          db.logEvent("job_sent", { queueId: row.id, jobKey: row.jobKey });
          results.push({ queueId: row.id, status: "sent", retryCount: 0 });
        } catch (e: any) {
          const res: { dead: boolean; retryCount?: number } | undefined = await db.markQueueFailed(row.id, String(e?.message ?? e).slice(0, 2000), Number(row.retryCount ?? 0));
          const status = res?.dead ? "dead" : "failed";
          db.logEvent(`job_${status}`, { queueId: row.id, jobKey: row.jobKey, retryCount: (res as any)?.retryCount ?? Number(row.retryCount ?? 0) + 1, error: String(e?.message ?? e).slice(0, 500) }, status === "dead" ? "error" : "warn");
          results.push({ queueId: row.id, status, retryCount: (res as any)?.retryCount ?? Number(row.retryCount ?? 0) + 1 });
        }
      }
      db.logEvent("worker_run_end", { processed: batch.length, sent: results.filter((r) => r.status === "sent").length, failed: results.filter((r) => r.status === "failed").length, dead: results.filter((r) => r.status === "dead").length });
      return { processed: batch.length, results };
    }),

  queueStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admins only.");
    return db.getQueueStats();
  }),

  deadLetters: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admins only.");
    return db.listDeadQueueRows();
  }),
});
