# HireWise — Recruitment Platform

HireWise is a full-stack recruitment platform built with React 19, Tailwind 4, tRPC 11, Drizzle ORM, and TiDB. It covers the complete hiring lifecycle: candidate profiles with consent-gated resume parsing, employer job posting, ranked matching, an ATS with immutable history, per-application messaging, and a durable notification engine with digests. The platform ships with a deterministic seed of 5,100 candidates, 2,100 published jobs, and 22,000 applications.

## 10-Minute Setup

```bash
pnpm install            # install dependencies
pnpm drizzle-kit push   # (or apply migrations) sync schema to the database
node scripts/seed.mjs   # deterministic, idempotent seed: 5,100 / 2,100 / 22,000
pnpm dev                # start the dev server (tsx watch, port 3000)
pnpm test               # run the vitest suite
```

The dev server exposes everything under `http://localhost:3000`. Authentication is handled by the platform OAuth provider at `/api/oauth/callback`; admin features (moderation, queue ops) require `role = 'admin'` on the user row.

## Architecture at a Glance

| Layer | Location | Purpose |
|---|---|---|
| Schema | `drizzle/schema.ts` | 20+ tables: users, profiles, companies, jobs, skills/aliases, applications, stage events, messages, notifications, queue, digests |
| Query helpers | `server/db.ts` | alias resolution, ranked search, ATS, queue, digests |
| API | `server/routers/*.ts` | tRPC routers: auth, skills, candidates, employers, jobs, ats, notifications, queue, digests |
| Client | `client/src/pages/` | Pages for every flow; tRPC hooks for all data |
| Shared logic | `shared/ranking.ts`, `shared/types.ts` | ranking weights, constants, types |

Routes: `/` (landing), `/jobs` (ranked search), `/jobs/:id` (detail), `/candidate` (dashboard), `/candidate/profile` (builder), `/employer` (dashboard), `/employer/job/:id/applications` (kanban ATS), `/admin` (moderation + queue ops), `/unsubscribe/:token` (public unsubscribe).

## Phase 1 — Identity, Profiles, Job Posting

Skills are a normalized controlled vocabulary: 439 canonical entries with 658 aliases, resolved at query time so "JS", "Javascript", and "JavaScript" all match the same skill. The multi-step profile builder persists every step server-side (`ProfileDraft`), survives refresh, and displays a live completeness score. Resume PDFs are extracted (pdfjs) into **suggestions the candidate must explicitly confirm** — parsed output is never written silently. Employers create companies, post jobs with required/preferred skill splits, salary ranges, remote policy, and seniority, and publish or unpublish on their own schedule.

## Phase 2 — Ranked Search and Facets

`rankedSearchJobs` scores every candidate in **one SQL statement**: title/body text (0.35/0.15), required/preferred skill overlap (0.30/0.10), haversine distance with remote-friendly override (0.10), recency decay with 30-day half-life (0.10), and salary compatibility (0.10) — an explainable 0–100 score with per-component breakdown. Because TiDB lacks FULLTEXT, text matching uses lowercased fragment LIKE with a bigram-similarity typo fallback tier (`javascrpt` still returns ~65 results). Faceted counts respect active filters from other dimensions, pagination uses a composite keyset cursor `(score, id)`, and all search state lives in the URL. Saved searches persist and drive digests.

## Phase 3 — ATS and Messaging

Applications carry a `UNIQUE(jobId, profileId)` constraint. Stage changes append to `ApplicationStageEvent` — the history is immutable and the current stage is always derived from the latest event; backward moves are allowed but never overwrite history. The kanban board has six stage columns plus a withdrawn group, with per-application move dialogs, threaded messaging (5 s polling, optimistic send, unread badges), and a full stage timeline. Employers can run candidate search over the same ranking machinery from the applications page. A moderation queue, heuristic spam scoring on new posts, and profile-view tracking round out the phase.

## Phase 4 — Notifications and Digests

Every meaningful event enqueues a durable job (`notification_queue`) with a unique `jobKey` for idempotency, exponential backoff over 6 retries, and a dead-letter view. A Heartbeat cron runs the worker every minute; scheduled endpoints deliver daily and weekly saved-search digests, deduplicated through a `digestRuns` ledger so a job is never sent twice. Email goes through Resend when `RESEND_API_KEY` is configured, otherwise a no-op transport logs every dispatch. Unsubscribe tokens are one-click and login-free, and the admin console reports queue depth, failure rate, and dead letters with structured JSON logging throughout (`logEvent`).

## Scripts

| Script | Purpose |
|---|---|
| `scripts/seed.mjs` | Deterministic, idempotent seed (candidates, jobs, applications, locations, skills) |
| `scripts/enrich2.mjs` | Text enrichment over existing rows (descriptions, summaries) |
| `scripts/seed-location-coords.mjs` | Backfill realistic lat/lng on locations |
| `scripts/generate-skills.py` | Deterministic skill taxonomy generator |

## Documentation

| Document | Content |
|---|---|
| `docs/ranking.md` | Ranking engine architecture, weights, typo tolerance, empty-query safety |
| `docs/perf/analysis.md` | EXPLAIN ANALYZE at pages 1 and 50, index inventory |
| `docs/decisions/` | Nine ADRs: single-SQL ranking, keyset pagination, no-FULLTEXT, TiDB prepared-statement workaround, consent-gated parsing, polling vs SSE, immutable history, durable queue, digest dedup |

## Testing

`pnpm test` runs vitest over `server/*.test.ts`: alias resolution, completeness scoring, draft persistence round-trips, router-level search/apply flows, and queue idempotency. Type checking via `npx tsc --noEmit` (zero errors in CI and at every checkpoint).

### Running tests from the ZIP (before the database is configured)

Integration tests need the database, so create a `.env` with

```
DATABASE_URL=mysql://<user>:<password>@<host>:<port>/<db>
```

(connection string in the Management UI → Database → settings; enable SSL) before testing. Until then `pnpm test` stays green: pure unit tests (scoring, completeness) run offline, and every DB-dependent suite skips itself with a clear hint instead of failing (see `server/testSetup.ts`). The suite never reports spurious failures from a missing database.
