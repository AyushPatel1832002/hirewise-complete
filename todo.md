# HireWise Phase 1 — TODO

## Schema & Data Layer
- [x] Drizzle schema: users (extend role), CandidateProfile, Company, CompanyMember, Job, Skill, SkillAlias, CandidateSkill (proficiency + years), JobSkill (required/preferred weight), Location, Application, ResumeParseSuggestion, ProfileDraft
- [x] Migration generated + applied
- [x] Query helpers in server/db.ts: alias resolution at query time, profiles, drafts, suggestions, jobs, applications
- [x] tRPC routers: skills, candidates (builder+draft+resume), employers, jobs, applications

## Skill Taxonomy
- [x] Deterministic seed of 300+ canonical skills across domains (439 skills, 658 aliases)
- [x] Aliases table: "JS", "Javascript", "JavaScript" → JavaScript (verified: all resolve to skill id 14)
- [x] Alias resolution at query time: resolveSkillByTerm / resolveSkillIdsByQuery used by job search (verified in seeder output)

## Candidate Flows
- [x] Multi-step profile builder UI (basics, location & pay, skills, work history, education, review & resume) — rendered with live step sidebar + completeness panel
- [x] Server-side per-step persistence (ProfileDraft table) — restore from draft on load (vitest-covered round-trip via saveProfileDraft/getProfileDraft/clearProfileDraft)
- [x] Live completeness score visible throughout flow (server computeCompleteness + client display)
- [x] PDF resume upload → server text extraction (pdfjs) → structured parse → pending suggestions only
- [x] Parsed results shown as suggestions; explicit confirm/reject gating; applyConfirmedSuggestion only on confirmed status

## Employer Flows
- [x] Company profile creation + CompanyMember linking (role-based access checks)
- [x] Post job: title, description, required/preferred skills split, salary range, location, remote policy, seniority
- [x] Publish / unpublish per job (setPublished mutation + authorization)
- [x] Employer dashboard with job management (myJobs, update, delete)

## Application Flow
- [x] Candidates apply to published jobs (submitApplication, published-gate)
- [x] Employer application review dashboard (jobApplications + status updates)

## Seed Script
- [x] Deterministic seeder: 5,100 candidates, 2,100 jobs, 22,000 applications with realistic distributions

## UI
- [x] Design system (Fraunces display + Inter + JetBrains Mono; ink-navy oklch palette; amber accents; .ink-surface, .card-lift, .skill-chip, .rise-in utilities)
- [x] Top navigation (SiteLayout) + landing page (hero, live stats 5,100/2,100/22,000/439, feature grid)
- [x] Job search + browse page (alias-aware search verified: 'js'→79 JS-tagged jobs, 'react'→227)
- [x] Candidate dashboard + profile builder (verified rendering with step sidebar + completeness panel)
- [x] Employer dashboard (verified rendering with company setup + post job flow)
- [x] Job detail + not-found state; verified /jobs/10000 renders, /jobs/1 shows graceful 'no longer available'

## Testing & Verification
- [x] Vitest coverage: alias resolution (js/Javascript/JavaScript→same id, multi-term, unknown), computeCompleteness, draft persistence round-trip (server/alias-draft.test.ts — 10 tests passing)
- [x] Verify searching "JS" matches JavaScript-tagged jobs (79 published jobs, all with canonical JavaScript tag)
- [x] Verify draft persistence survives refresh (getProfileDraft restores after saveProfileDraft; UI shows 'Last saved step' note)
- [x] pnpm test green (3 files, 11 tests incl. router-level E2E draft round-trip) + tsc 0 errors
- [x] Alias breadcrumbs on /jobs results ("resolved: js → JavaScript") + matched-skill chip highlight
- [x] Home feature grid → numbered "Operating principles" ledger
- [x] /jobs input hydrates from URL ?q= param

## Delivery
- [x] ZIP export of complete project (project + scripts, excluding node_modules/dist)

# Phases 2–4 (per spec PDF)

## Phase 2: search & ranking
- [x] Locations lat/lng columns + seed realistic coordinates (backfilled)
- [x] shared/ranking.ts: single configurable weights object (RANKING_WEIGHTS — text title/body, skills required/preferred, distance, recency+halfLife, salary, maxDistanceKm, typoFallbackMinResults; sum to 1, drives all SQL scoring)
- [x] db.ts: rankedSearchJobs — one SQL query: text relevance (title weighted), skill overlap (required vs preferred), geo distance w/ remote-friendly override, recency decay, salary compatibility (TiDB PS bug fixed: weights inside CASE branches; alias s.weight→js4; SIMILARITY_CAND→fragmentSim 3-gram overlap; salary default 1)
- [x] Typo-tolerance fallback tier (fragment-similarity score > 0.4 when exact tier < 3 results) — verified: 'javascrpt' returns 65 typo results
- [x] Faceted filters: seniority, remote policy, salary band (multi-select; server facetCounts now takes active filters from OTHER dimensions so each facet's own dimension is excluded — verified with multi-select curl tests: react+remote → remote facet={remote:28} only, seniority/salary re-counted under remote)
- [x] Keyset pagination with composite cursor (score DESC, id DESC) tiebreaker
- [x] Employer candidate search (job → candidates) over same machinery (candidateSearch.run → rankedSearchCandidates with job skills; "Find matching candidates" panel on the applications page)
- [x] Explainable match score 0–100 + per-result breakdown (rawText/rawSkills/rawDistance/rawRecency/rawSalary columns)
- [x] SavedSearch table + persist/name/list/re-run (savedSearches router: list/save/delete; UI save-current-search button when URL has filters; digests consume saved searches)
- [x] All search state in URL (shareable, back-button correct)
- [x] UI: results show score + breakdown bar/popover
- [x] docs/ranking.md + docs/perf/analysis.md (EXPLAIN ANALYZE page 1 + page 50, timings, index list)

## Phase 3: applications, ATS, messaging

- [x] Application: profile + optional cover letter; UNIQUE constraint on (jobId, profileId) — exists in DB as uq_app_job_profile, now explicit in schema; withdrawal flow
- [x] ApplicationStageEvent table (immutable history; stage derived from latest event); backward moves now allowed (STAGE_TRANSITIONS extended; history always appended)
- [x] Employer kanban ATS board: 6 stage columns + collapsible withdrawn; Move dropdown → ats.move with optional note Dialog; Mail → conversation Sheet with 5s polling + optimistic send + read states; History → stage timeline Dialog (immutable events); match% + unread badges; sort by match/newest (conversation uses a max-height Dialog with threaded layout — functionally the chat panel specified)
- [x] Messages scoped to application; unread counts (atsRouter.conversation/sendMessage/unreadCounts)
- [x] Polling-based message refresh (chosen over SSE — justify in ADR)
- [x] Candidate dashboard: application status timeline (ats.history per application via History button → Dialog); employer profile-view counter (ats.profileViewCount card); saved searches panel (save current URL filters, list/delete, digest mention)
- [x] SiteLayout notification bell (notifications.unreadCount + badge + NotificationCentre Dialog with mark read + prefs toggles) + saved searches panel in CandidateDashboard + /unsubscribe/:token public page (UnsubscribePage) + admin /admin page (reports + queueStats/deadLetters)
- [x] Candidate search panel on employer job/applications page (candidateSearch.run → CandidateSearchPanel)
- [x] Admin moderation backend: moderation queue (reported jobs/profiles, actions); heuristic spam scoring on new job posts (atsRouter.reports/resolveReport/reportTarget/spamScore)
- [x] docs/ranking.md + docs/perf/analysis.md (EXPLAIN ANALYZE page 1 + page 50, timings, index list)
- [x] docs/decisions/ with 9 ADRs (polling-vs-SSE, no-FULLTEXT-in-TiDB, TiDB PS CASE bug, consent-gated parsing, immutable-stage-history, single-SQL ranking, keyset pagination, durable queue, digest dedup)
- [x] README 10-min covering Phases 1–4
- [x] Vitest additions: scoring units, alias units, queue retry/DLQ/idempotency (same jobKey twice), E2E search→apply→move→notify
- [x] Re-seed verification after schema changes: idempotent run complete — counts verified (5,100 candidates, 2,100 jobs, 22,000 applications, 439 skills, 658 aliases, js alias→id 14); ranked search + 25 tests green post-seed
- [x] final checkpoint saved (b08bc834) + final ZIP export

## Post-delivery test fixes (user report)

- [x] Root cause: user ran `pnpm test` from the ZIP without DATABASE_URL — all DB-touching tests failed with null errors
- [x] Fix: shared `server/testSetup.ts` — DB_UNAVAILABLE detection, per-describe skipIfNoDb guards, conditional connectivity probe; wired into all 4 DB-dependent suites (auth.logout.test.ts needs no DB and stays green)
- [x] Full pnpm test green: 25/25 with DB; no-DB run graceful and verified on a fresh ZIP copy (Test Files 3 passed | 2 skipped; Tests 8 passed | 8 skipped; 0 failed, clear hint message printed); README updated

## Phase 4: notification pipeline

- [x] Notification + preference + unsubscribe token tables
- [x] notification_queue table: status/retry/backoff/DLQ; idempotent job_key
- [x] Event-driven enqueueing: new application, stage change, new message, profile viewed
- [x] Saved-search alerts: daily + weekly digests w/ sent-job tracking (never duplicate a job across digests; digestRuns ledger)
- [x] Worker: /api/scheduled/processQueue (Heartbeat cron, every minute) + digest crons (daily, weekly) — public endpoints in server/_core/index.ts
- [x] Email transport: Resend if RESEND_API_KEY else no-op logger; email_send_log; Gmail/Outlook-safe HTML templates
- [x] Tokenized one-click unsubscribe (no login) — notifications.unsubscribe + /unsubscribe/:token
- [x] In-app notification centre with read state + badge (NotificationCentre in SiteLayout)
- [x] Admin ops view: queue depth, failure rate, DLQ contents (/admin → queueStats/deadLetters)
- [x] Structured logging helper (logEvent in server/db.ts queue layer) + worker lifecycle events verified in devserver.log
- [x] Failure-rate reporting in admin queue view (failed+dead / total, shown on /admin)

## Docs & hardening
- [x] docs/decisions/ with 9 ADRs
- [x] README (10-min) covering Phases 1–4
- [x] Vitest: scoring unit tests, alias resolution unit tests, queue retry/DLQ/idempotency integration tests, E2E search→apply→stage→notify via router callers (server/queue-idempotency.test.ts)
- [x] Re-seed verification after schema changes: idempotent run complete — counts verified (5,100 candidates, 2,100 jobs, 22,000 applications, 439 skills, 658 aliases, js alias→id 14); ranked search + 25 tests green post-seed
- [x] final checkpoint saved (b08bc834) + final ZIP export

## Post-delivery test fixes (user report)

- [x] Root cause: user ran `pnpm test` from the ZIP without DATABASE_URL — all DB-touching tests failed with null errors
- [x] Fix: shared `server/testSetup.ts` — DB_UNAVAILABLE detection, per-describe skipIfNoDb guards, conditional connectivity probe; wired into all 4 DB-dependent suites (auth.logout.test.ts needs no DB and stays green)
- [x] Full pnpm test green: 25/25 with DB; no-DB run graceful and verified on a fresh ZIP copy (Test Files 3 passed | 2 skipped; Tests 8 passed | 8 skipped; 0 failed, clear hint message printed); README updated
- [x] Fix TiDB prepared-statement parse bug: `? * (CASE ... END)` fails; move weight multiplication inside CASE branches
- [x] Verify jobs.ranked HTTP endpoint returns 200 with score breakdown
- [x] Verify facetCounts endpoint works (fixed titleOr reduce init bug)
- [x] Enrich seeded data: seed.mjs patched (descriptions + candidate summaries include skill names) + scripts/enrich2.mjs applied over existing rows
