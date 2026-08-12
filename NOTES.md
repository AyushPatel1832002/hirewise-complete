# HireWise — Phase 1 COMPLETE. Now building Phases 2, 3, 4 per user's PDF spec.

## Project reality check (adaptation notes)
- Real platform: Manus webdev template = Vite + React (SPA) + Express + tRPC + Drizzle + MySQL/TiDB. NOT Next.js/Postgres as spec says.
- Adaptation: implement the spec's concepts within this stack. MySQL has tsvector? NO — MySQL doesn't have tsvector/pg_trgm. MySQL uses FULLTEXT indexes + LIKE. We adapt: FULLTEXT index on title/description (setweight simulated by duplicating title twice in index), skill overlap SQL, geo: locations table has no lat/lng currently — check; if missing add lat/lng columns & haversine via SQL.
- Typo tolerance fallback: LIKE/sound-based fallback when FTS too few results.
- Queue: no Redis available. Use pg-boss-like approach: Postgres-backed job queue table (jobs) + worker triggered by scheduled Heartbeat jobs with retry/backoff + dead-letter table. Same contract: retry, backoff, DLQ, idempotency.
- Background queue = DB table `notification_jobs` + scheduled worker (Heartbeat). Document in ADR.
- Email: Resend may not be available; use a mock/pluggable mail transport (Resend env optional) + render HTML; log sent emails to `emails_sent` table; unsub tokens work regardless.
- SSE polling: use polling (10s) for messages — justify in ADR.

## Phase 2 requirements (search & ranking)
- One SQL query ranking: FTS-like text relevance (title weighted), skill overlap required vs preferred weights, recency decay, salary compatibility, typo-tolerance fallback tier
- Faceted filters: seniority, remote policy, salary band, company size, skills; correct multi-select counts (facet's own dimension excluded from its count)
- Keyset pagination with composite cursor (score tiebreaker) — page 50 comparable time
- Employer candidate search: same machinery inverted (job skills vs candidate skills)
- Explainable match score 0-100 + breakdown per result in UI
- Saved searches: name, persist, list, re-run
- All search state in URL (shareable, back button correct)
- Weights configurable in one place
- docs/ranking.md + docs/perf/ (EXPLAIN ANALYZE, index list, timings)

## Phase 3 requirements (applications, ATS, messaging)
- Apply with profile + optional cover letter; UNIQUE constraint dup prevention; withdrawal
- Kanban ATS: applied → screening → interview → offer → hired | rejected; drag between stages (buttons OK), bulk actions, per-stage notes
- Immutable stage transition event history (survives backwards moves)
- Messaging scoped to application, unread counts, polling (chosen over SSE)
- Candidate dashboard: application status timeline + employer profile views counter
- Admin: moderation queue for reported jobs/profiles with actions; heuristic spam scoring on new posts

## Phase 4 requirements (notification pipeline)
- Job alerts from saved searches; daily + weekly digests; never duplicate a job across digests (track sent)
- Event-driven notifications: new application, stage changed, new message, profile viewed
- Per-user per-channel per-event preferences; tokenized one-click unsubscribe w/o login
- Queue with retry, exponential backoff, DLQ; idempotent handlers
- In-app notification centre with read state
- Email rendering via React Email (react-email + plain HTML w/ Resend if env present), ops view (queue depth, failure rate, DLQ)
- Structured logging; docs/decisions/ with 8+ ADRs; README

## DB platform findings (Phase 2-4 constraints)
- Database = TiDB v8.5.3-serverless (MySQL 8.0-compatible, NOT PostgreSQL). FULLTEXT indexes are unsupported ('Unsupported FULLTEXT index'). LIKE '%x%' scans run ~235ms on 2,100 rows — acceptable but not GIN-equivalent.
- Adaptation (document in ADR docs/decisions/03-search-engine.mdo — use .md): ranking engine = single SQL query ranking by composed score via JSON-overlays: text relevance approximated with boolean MATCH-substitute using LIKE + token weighting in SELECT expressions (CASE WHEN title LIKE → title weight, body LIKE → body weight, both→sum), skill overlap via JOIN aggregates, geo via latitude/longitude on locations + haversine in SQL, recency decay via DATEDIFF in SELECT.
- Since LIKE full scans are slow-ish but fine at 2k rows, the primary filter set uses indexed filters (published, seniority, remote, salary ranges, location) to shrink candidate set, then rank in SQL.
- ts_rank_cd/pg_trgm/earthdistance → emulated: setweight via LIKE weights in SELECT; typo-tolerance fallback tier = LIKE + 2-char substring overlap similarity (manual trigram-like similarity via SQL expression) only when tier-1 LIKE returns < threshold.
- Add columns: locations.latitude DECIMAL(10,7) NULL, locations.longitude DECIMAL(10,7) NULL; seed realistic lat/lon per city.
- Keyset pagination: cursor = (score, id) composite; encode in ?cursor= param.
- Queue: jobs table `notification_queue` with status/retry_count/backoff_until/dead_lettered; worker = tRPC + scheduled Heartbeat cron firing /api/scheduled/processQueue every 1 min; idempotent by unique job_key.
- Email: Resend optional via RESEND_API_KEY env; always log to email_send_log; render templates via shared email templates (plain HTML w/ inline styles, Gmail/Outlook safe).
- Docs: docs/decisions/ (8+ ADRs, .md files), docs/ranking.md, docs/perf/ (EXPLAIN ANALYZE — TiDB uses EXPLAIN + EXPLAIN ANALYZE; GIN→document the emulation decision).

## Existing state
- Version 8723d08f. MySQL/TiDB. 13 tables in drizzle/schema.ts. 439 skills/658 aliases. Seed 5100/2100/22000. 11 tests passing.
- Jobs search currently: text search + skill resolution + filters in db.ts getPublishedJobs.
- Locations table: city/region/country (no lat/lng yet) — add them.
- Heartbeat SDK: bootstrap-legacy-project ran earlier? heartbeat.ts exists in server/_core/.

## Schema additions needed (Phases 2-4)
- SavedSearch (userId, name, serialized query)
- Notification (userId, type, payload, readAt, channel)
- NotificationPreference (userId, channel, eventType, enabled)
- UnsubscribeToken (token hash, userId, scope)
- NotificationJob / NotificationJobAttempt / DLQ: use `notification_queue` table + attempts + status
- EmailSendLog (dedup of digests: sent_jobs per digest run)
- ApplicationStageEvent (applicationId, fromStage, toStage, at, note, actorUserId) — stage as derived from last event
- Message (applicationId, senderUserId, text, readAt)
- JobReport / ProfileReport (moderation queue)
- SpamScore log on jobs (on publish)
- ProfileView (employer views candidate)
- ClickLog (search click) optional stretch
- Ranking weights constant file: shared/ranking.ts

## Worker scheduling (Heartbeat)
- Read /home/ubuntu/skills/webdev-periodic-updates/SKILL.md first.
- Digest runs: cron daily (7am) + weekly (Mon 7am) Heartbeat jobs → enqueue digest workers.

## Implementation plan details (Phase 2 start)
Current db.ts has 702 lines, functions listed via grep above. Key existing functions: resolveSkillIdsByQuery, getPublishedJobs (line 327, complex filter+rank-ish query), applyToJob (607), getJobApplications (627), getMyApplications (661), updateApplicationStatus (674), listLocations (684).

Approach for Phase 2 ranking query (single SQL, drizzle sql``):
- SELECT job rows joining candidate/candidateSkills aggregated for each job? No — job search ranks jobs: text weights + skill overlap (count required matches / total required + 2*preferred etc.) + distance (if location filter given OR user profile location) + recency (1/(1+days/30)) + salary (0 or 1).
- Skill overlap: derived tables via JSON_TABLE or GROUP_CONCAT subquery. Simpler: subquery (SELECT COUNT(*) FROM jobSkills js JOIN candidateSkills cs ON ... WHERE js.jobId = j.id) for required + preferred. With 2100 jobs and ~5 skills/job this is fine.
- Cursor: WHERE (score, id) < (:score, :cursorId) ORDER BY score DESC, id DESC LIMIT N. Encode cursor as base64(score~id).
- Facets computed by same WHERE-minus-dimension pattern in one helper call.
- UI: Jobs.tsx gets score chips + breakdown dialog; URL state via useLocation() from wouter (path /jobs?q=&seniority=&remote=&salary=&size=&skills=&loc=).
- SavedSearch: table savedSearches (id, userId, name, queryJson); procedures savedSearches.create/list/run/delete.

Location seed coords: San Francisco (37.7749,-122.4194), New York (40.7128,-74.0060), Austin (30.2672,-97.7431), Seattle (47.6062,-122.3321), Boston (42.3601,-71.0589), Chicago (41.8781,-87.6298), Denver (39.7392,-104.9903), Atlanta (33.7490,-84.3880), Toronto (43.6532,-79.3832), London (51.5074,-0.1278), ... 145 locations — seed only major cities coords; others NULL (distance null-safe → distance rank mid).

Phase 3 specifics:
- apps UNIQUE(jobId, profileId) — ALTER TABLE applications ADD UNIQUE uq_app_job_profile (jobId, profileId); applyToJob catches Duplicate key → ALREADY_APPLIED error.
- Withdraw: new status withdrawn via updateApplicationStatus; allow from any non-terminal.
- ApplicationStageEvent: (id, applicationId, fromStatus, toStatus, note, actorUserId, at). Update application.status = derived latest event toStatus. Moving backward: new event; history intact.
- Kanban UI: new page /employer/ats with board columns; move via mutation moveApplication(applicationId, toStatus, note?); bulk move (ids[], toStatus).
- Messages: table messages (id, applicationId, senderUserId, text, readAt); procedures sendMessage/getThread/countUnread(mark read on open). Polling 10s in chat UI (SSE not supported well on Cloud Run + ADR justifies polling).
- ProfileView: table profileViews (employerUserId, profileId, at) — record when employer views candidate detail in ATS. CandidateDashboard shows counts.
- Reports: table reports (id, targetType job|profile, targetId, reporterUserId, reason, status pending/resolved/dismissed, at); reportJob/reportProfile mutations; admin list + actions.
- Spam scoring: simple heuristic on createJob/post — long caps ratio, short description, url density → spamScore stored on jobs; admin flag if > threshold.

Phase 4 specifics:
- notification_queue (id, job_key UNIQUE, channel, subject?, payload JSON, status pending/processing/sent/failed/dead, retry_count, backoff_until, last_error, created_at).
- Worker: POST /api/scheduled/processQueue triggered by cron every minute (Heartbeat CLI --name notification-worker). Picks max N pending where backoff_until <= now, FOR UPDATE style processing via UPDATE status=processing WHERE id=... and id IN (SELECT). Backoff = 60*2^retry capped 3600; after 6 retries → dead_lettered. Idempotent: unique job_key → duplicate inserts fail.
- Digest: daily cron 07:00 UTC + weekly Mon 07:00. digest run table digest_runs (id, savedSearchId, runAt, frequency, jobsSentCount); per-run job tracking table digest_sent (digestRunId, jobId) — job never appears twice across digests: EXCLUDE jobs already in digest_sent for that savedSearch in any run.
- Event enqueuing: on apply → notify employer; stage change → notify candidate; message → notify other party; profileView → notify candidate.
- Preferences table notification_preferences (userId, channel in_app|email, eventType*, enabled).
- Unsubscribe: unsubscribe_tokens (id, userId, channel?, token VARCHAR UNIQUE, createdAt); link /unsubscribe?token=xxx → GET page w/o login → disable email prefs → confirm.
- In-app notifications table notifications (id, userId, type, payload, readAt, createdAt); procedures list+mark read.
- Email transport: if RESEND_API_KEY env → post to api.resend.com/email (fetch), else log to email_send_log with status logged_only.
- Admin ops view: /admin/ops — queue stats (pending/processing/failed/dead counts), failure rate (failed/sent in 24h), DLQ list + retry.

Docs: docs/decisions/{01-monorepo-template,02-auth,03-search-engine,04-ranking-formula,05-keyset-pagination,06-queue-design,07-messaging-polling,08-email-idempotency,09-facet-counts}.md — write 9. docs/ranking.md, docs/perf/ (explain outputs). README update.

Testing: add server/ranking.test.ts (scoring unit), server/queue.test.ts (DLQ/retry/idempotency via db helpers), server/search-relevance.test.ts (fixture integration via router), server/e2e-flow.test.ts (search→apply→stage→notify via routers).

## STATE CHECKPOINT (Phase 2 in progress)
Done so far:
- Schema migration 0002 applied via webdev_execute_sql: 12 new tables (applicationStageEvents, digestRuns, digestSent, emailSendLog, messages, notificationPreferences, notificationQueue, notifications, profileViews, reports, savedSearches, unsubscribeTokens) + locations.latitude/longitude.
- Indexes added: uq_app_job_profile UNIQUE on applications, idx_stageevents_application, idx_notifications_user, idx_notifqueue_status_backoff, idx_notifqueue_jobkey, idx_digestsent_run, idx_messages_application, idx_savedsearches_user, idx_profileviews_profile, idx_reports_status, idx_digestruns_savedsearch.
- scripts/seed-location-coords.mjs: backfills lat/lon for 29 major cities; 140 rows now have coords.
- shared/ranking.ts: RANKING_WEIGHTS (text.title .35, text.body .15, skills.required .3, skills.preferred .1, distance .1, recency .1 (halfLife 30d), salary .1), MAX_SCORE=100, maxDistanceKm=3000, typoFallbackMinResults=3, bigramSimilarity().
- db.ts imports updated with all new schema tables.

Next to implement:
1. db.ts rankedSearchJobs(opts {query, locationId, locationLat, locationLng, remotePolicy, seniority, minSalary, maxSalary, companySize, skillIds[], cursor, pageSize=20}) — single SQL via db.execute(raw) using drizzle sql`` tagged template inside db.execute. Score breakdown per row returned. Keyset: WHERE (score,id)<(c,cid) ORDER BY score DESC, id DESC.
2. Facet counts helper facetCountsFor(opts): run filtered query minus each dimension; return counts.
3. Candidate ranked search (jobs → candidates): rankedSearchCandidates(opts {jobId | skillIds, location..., pageSize, cursor}).
4. Routers: jobs.rankSearch, jobs.facets, jobs.candidateSearch; savedSearches (create/list/run/delete); candidates.profileView, candidate.notifications + notifications router (list/markRead); messaging router (send/thread/unread); employers.ats (board, moveApplication with immutable event, bulk), employers.stageHistory, employers.messageJobApplication?; admin router (reportJob/reportProfile by users; moderation list/actions; queue ops view; spam scoring on post + admin flag list).
5. Notification enqueue helper server/notifications.ts: enqueueEvent({eventType, userId, channel?, payload}) checks prefs, upserts notification + queue row for email channel (if user has email pref) w/ unique jobKey.
6. Email transport server/email.ts: if RESEND_API_KEY → fetch https://api.resend.com/emails; else outcome=logged_only + html render. Templates: renderJobAlertEmail, renderDigestEmail, renderEventEmail, renderUnsubscribeFooter(token).
7. Worker: server/queueWorker.ts processQueue(opts {maxBatch=20}): SELECT pending WHERE backoffUntil<=now ORDER BY id LIMIT N → mark processing → send → sent or failed w/ retryCount++ backoff = 60*2^retry capped 3600; after 6 → dead. jobKey unique → idempotent. Digest workers daily/weekly: for each savedSearch create digestRun window, find jobs matching query published in window NOT already in digestSent for that savedSearch (any run), upsert queue rows, mark completed.
8. Scheduled handler /api/scheduled/processQueue + /api/scheduled/digestDaily + /api/scheduled/digestWeekly in server/_core/index.ts + Heartbeat CLI c
rons: processQueue every minute, digestDaily 0 0 7 * * *, digestWeekly 0 0 7 * * 1. CLI: manus-heartbeat create --name X --cron "...sec min hour dom mon dow" --path /api/scheduled/X. Handlers mounted in server/_core/index.ts BEFORE vite fallthrough: app.post("/api/scheduled/processQueue", processQueueHandler); auth via sdk.authenticateRequest → user.isCron + user.taskUid.
9. Client: Jobs.tsx upgrade (score chips + breakdown dialog via Dialog; URL state wouter useLocation/useSearchParams via qs parsing; saved search save dialog; facets multi-select); CandidateDashboard (profile views count, status timeline from stage events, notifications bell); EmployerDashboard (ATS kanban tab, messages per application); AdminNav + admin/moderation + admin/ops pages; Unsubscribe page /unsubscribe?token= (no auth) GET renders confirm + POST disables prefs; messages UI polling 10s.
10. Docs: docs/decisions/ 01..09 .md, docs/ranking.md, docs/perf/ (EXPLAIN ANALYZE outputs for ranked query page1 + page50 — TiDB supports EXPLAIN ANALYZE; run via node script save to files). README update.
11. Tests: server/ranking.test.ts unit (score formula), server/queue.test.ts (retry/backoff/DLQ/idempotency via db helpers), server/search-relevance.test.ts (fixture: seeded data known-good results), server/e2e-flow.test.ts (router E2E: apply unique, stage event history, message, notification, digest dedup).
12. Existing dev server errors in console log are STALE (11:54am from yesterday's fixed JS bug) — ignore.
13. DB = TiDB v8.5.3 (MySQL compat, no FULLTEXT). Ranking query = raw SQL via db.execute(sql`...`). LIKE-based text tier, bigram similarity for typo tier, haversine in SQL (ACOS approximation w/ RADIANS), recency 0.5^(days/30) via POW(2, -DATEDIFF/30).
14. Project version: 8723d08f (Phase 1 checkpoint). Create new checkpoints after Phase 2 and after Phase 4.
