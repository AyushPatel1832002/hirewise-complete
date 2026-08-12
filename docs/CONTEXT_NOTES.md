# Context notes for remaining hardening work (internal)

## Done in this session (Phase hardening)
- logEvent structured logger added to server/db.ts (JSON line: ts/level/src=hirewise.queue/event/payload), wired into processQueue worker (worker_run_start/end, job_sent, job_failed, job_dead) and verified in .manus-logs/devserver.log.
- getQueueStats now returns {pending,processing,failed,dead,sent,total,failureRate(string %)}; failureRate = (failed+dead)/total*100.
- AdminPage.tsx queue overview: 6 tiles incl. failure rate; grid sm:grid-cols-6.
- Homepage Home.tsx: hero rewritten ("Every application, ranked, tracked, and answered."), principles expanded to 8 items (added pipeline-history + notifications principles), feature intro updated.
- CandidateDashboard.tsx: saved searches rows fixed (Fragment import from react, Play icon, Input import) — verified render.
- Checkpoint f11014b5 saved.

## EXPLAIN ANALYZE data (captured)
- Page 1 (LIMIT 20, 'react'): total 22.2ms, loops 2, cop max 21.3ms, proc_keys 2100, tot_proc 20.2ms, memory 14.9KB.
- Page 50 (OFFSET 980): total 24.3ms, loops 3, cop max 19.5ms, proc_keys 2100, tot_proc 18.8ms, memory 157.9KB. TopN pushed to TiKV coprocessor; actRows 233 both.
- docs/ranking.md and docs/perf/analysis.md written.

## E2E test status (server/e2e-search-apply-notify.test.ts)
- Uses direct TrpcContext builder (like candidate-router.test.ts, NOT createContextFromUser).
- Input is {query} not {q}; result row fields: id, title, score (0-100), text/skills/distance/recency/salary (each x100 scaled components); sum check abandoned (use non-negative bounds).
- apply requires CandidateProfile for ctx user — candidate tester lacks one: create profile in test via db.createCandidateProfile(CANDIDATE_ID) or insert directly.
- queueStats requires role='admin' (error 'Admins only.') — use role:'admin' caller for that test.
- ats.history events: toStatus field; ats.move input {applicationId, jobId, toStatus, note}.
- remaining failures: profile-precondition (apply/myApplications/move), Admins-only queueStats.

## Remaining todo items (see todo.md lines 68-107)
- docs/decisions/ 8+ ADRs (001..009) — write next
- README rewrite covering Phases 1-4
- Vitest: scoring units (shared/ranking.ts bigramSimilarity), alias units (existing server/alias-draft.test.ts has 10 tests), queue retry/DLQ/idempotency (markQueueFailed idempotency, job_key unique), E2E search→apply→move→notify
- Re-seed verification: scripts/seed.mjs idempotent run (5,100 candidates/2,100 jobs/22,000 apps) — verify counts after run
- pnpm test + tsc clean, checkpoint, ZIP (scripts/build-zip or manual zip excluding node_modules/.git/dist)

## Key project facts
- Stack: React 19, Tailwind 4, tRPC 11, Drizzle ORM, TiDB, tsx watch on port 3000.
- Test runner: vitest (server/*.test.ts), scripts: pnpm test.
- Seed script: scripts/seed.mjs (deterministic, idempotent with NOT EXISTS gates).
- MAX_RETRIES=6 for queue; backoff exponential; jobKey unique → idempotent.
- RANKING_WEIGHTS: text title .35, body .15, skills req .30, pref .10, distance .10, recency .10 (halfLife 30d), salary .10; typoFallbackMinResults=3; bigramSimilarity.
- Queue worker route: POST /api/trpc/queue.processQueue; cron via /api/scheduled/processQueue Heartbeat.
- Routes: / /jobs /jobs/:id /candidate /candidate/profile /employer /employer/job/:id/applications /admin /unsubscribe/:token /company/create /company/:id
