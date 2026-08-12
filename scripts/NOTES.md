# HireWise Dev Notes (context-safety)

## Current session state (Phase 2 ranked search fixes)
- Project: /home/ubuntu/hirewise (React19+Tailwind4+tRPC11+Drizzle+TiDB MySQL)
- Phase 1 complete (checkpoint 8723d08f). Phase 2 in progress.

## Key bugs found & fixed in server/db.ts (rankedSearchJobs)
1. TiDB prepared-statement parser bug: `? * (CASE ... END)` fails syntax. Fixed by pushing weights INSIDE CASE branches in scoreFrag. (Also discovered: COALESCE(CASE WHEN NULL IS NULL ...) inside `? * (...)` failed; plain CASE works.)
2. preferredExpr used bad alias `s.weight` → fixed to `js4.weight`.
3. SIMILARITY_CAND function doesn't exist in TiDB → replaced with `fragmentSim()` helper (3-char sliding fragment LIKE overlap, CAST sum/DECIMAL / n).
4. Score breakdown: added rawText/rawSkills/rawDistance/rawRecency/rawSalary columns to select; `scoreAll()` now uses them.
5. salaryExpr defaulted to 0 when no salary filter → now defaults to 1.
6. facetCountsForJobs: titleOr reduce init bug (empty sql`` leading to `AND ( OR ...)`); split into titleOrs + reduce.

## Still to fix
- Fuzzy/typo tier returns 0 rows: seeded job descriptions are GENERIC boilerplate with NO skill keywords (e.g. "We are looking for a talented senior devops engineer..."). Text/fragment matching can never hit.
- FIX PLAN: enrich seed: rewrite job descriptions in scripts/seed.mjs (line ~458-ish, jobValues push) to include the assigned skill names (req/pref cat arrays) naturally, e.g. "You'll work with X, Y, Z...". Also enrich candidate profile summaries (profileValues) with their skill names for candidate-side search.
- Then the fragment-sim fuzzy tier (threshold >0.4, k >= 0.47*n fragments) should work. NOTE: frag-int integer version (sum >= k) also returned 0 rows due to missing keywords — after enrichment, verify again.
- Performance: LIKE full scans take ~230ms per 2k rows (fine). Complex CASE-heavy queries HANG occasionally (~60s) under load — likely TiDB proxy saturation from leaked connections during long tests. Fresh connections recover. Keep queries simple.

## Test helpers
- scripts/check_ranked.py: tests jobs.ranked exact+typo+pagination
- scripts/check_facets.py / check_facets2.py: jobs.facetCounts
- scripts/check5.py: typo query "javascrpt"
- DB: `process.env.DATABASE_URL` via dotenv; use `node -e` with mysql2/promise, connectTimeout 10000, query() text protocol. Pipe output to file (`> /tmp/log`) to avoid lost output on timeout kill.
- jobs table: id starts at 10000, published=1 → 1825 rows. Skills resolved via aliases; "js" → skill id 14 (javascript).

## TODO additions (already appended to /home/ubuntu/hirewise/todo.md)
- [ ] Fix TiDB prepared-statement parse bug (done)
- [ ] Verify jobs.ranked HTTP 200 with breakdown (done, works)
- [ ] Verify facetCounts (done, works after titleOr fix)
- [ ] Enrich seeded job descriptions with actual skill names so text/fragment search is meaningful
- [ ] Verify typo/fragment fallback tier returns results after enrichment
- [ ] Remaining Phase 2 UI: ranked results view + faceted filters
- [ ] Phase 3: Kanban ATS + messaging UI
- [ ] Phase 4: notification pipeline + digests; verify worker per periodic-updates skill
- [ ] Final: vitest pass, checkpoint, deliver ZIP

## Architecture notes
- server/db.ts rankedSearchJobs: two tiers (exact + typo), skillIds via resolveSkillIdsByQuery (aliases), runTier uses db.execute(drizzle sql). 
- fragmentSim returns CAST(sum CASE)/n expression; fuzzyScore > 0.4 threshold.
- weights in shared/ranking.ts (text.title 0.35, body 0.15, skills req 0.3/pref 0.1, distance 0.1 maxDistanceKm 3000, recency 0.1 half-life 30d, salary 0.1; typoFallbackMinResults 3).

## State as of current session (continued)
- Data enrichment COMPLETE: scripts/enrich2.mjs (batched CASE-UPDATE) updated all 1,825 published job descriptions with skill names ("You will work with X, Y... Requirements: ...") and 5,100 candidate profiles have "Skilled in ..." summaries. seed.mjs also patched (patch_seed_desc.py applied; profileValues push moved after skill picking with topSkillNames; candidateSkillValues loop now before profileValues.push).
- check_ranked.py verified: exact search 'js' → totalExact 65, text score now 15 for matched jobs. Typo 'javascrpt' → totalExact 0, totalWithTypo 65 with fuzzy tier results (scores ~30 dominated by distance/recency/salary since typo token doesn't resolve skill ids — expected).
- rankedSearchJobs + facetCounts endpoints both HTTP 200.
- Jobs.tsx just rewritten: ranked search mode w/ URL-state (?q=&remote=&seniority=&bucket=), faceted sidebar (remote/seniority/salary bucket multi-select, server counts per query), score pill + expandable 5-signal breakdown, keyset load-more, browse fallback toggle (?v=browse uses jobs.browse).
- FIX NEEDED: Jobs.tsx TypeScript errors (16): location object shape is { latitude, longitude, displayName } NOT { lat, lng }; missing Select import (Select/SelectContent/SelectItem/SelectValue/SelectTrigger) — I imported from ui/select but TS complained, verify import path '@/components/ui/select'; also `const Select` name clash? No — just missing imports in the new file header. Also need locationId support? I dropped locationId; OK to leave.
- locations endpoint returns: { id, city, region, country, displayName, latitude, longitude }.
- TODO next: fix Jobs.tsx TS errors; verify /jobs renders (screenshot); then Phase 3 ATS kanban + messaging; Phase 4 notifications+digests w/ heartbeat; vitest; checkpoint; ZIP delivery.
- UI notes: design system classes exist: ink-surface (dark hero bg), bg-card, card-lift, skill-chip (with .required/.matched variants), rise-in, amber text color class, Border 'border-border'.
- Existing Jobs page skills chips referenced job.skills from jobs.browse (getPublishedJobs includes skills). ranked endpoint does NOT include skills — result cards don't show skill chips in ranked mode; acceptable (score pill replaces), could add later.
- Phase 3-4 DB tables exist in drizzle/schema.ts (applicationStageEvents, messages, notifications, notificationPreferences, notificationQueue, digestRuns, digestSent, savedSearches, profileViews, reportedContent etc.) — check drizzle/schema.ts for exact table names before building.
- Heartbeat: server/_core/heartbeat.ts exists; use webdev-periodic-updates skill for digest worker.

## Phase 3-4 plan (current session)

### Existing assets (already in codebase)
- db.ts has Phase 2 foundations: moveApplication (immutable events via applicationStageEvents, STAGE_TRANSITIONS map), getStageHistory, getApplicationById, recordProfileView/getProfileViewCount, sendMessage (+ getMessages? — only sendMessage seen at line 1074), plus notifications queue helpers maybe (need to check later lines).
- routers: server/routers.ts mounts system, auth, skills, candidates, employers, jobs (jobsRouter + applicationsRouter), from split files in server/routers/. applicationsRouter has submitApplication, myApplications, hasApplied.
- Schema tables (drizzle/schema.ts): applications (status denorm), applicationStageEvents, profileViews, messages (applicationId, senderUserId, text, readAt), reports, savedSearches (userId, name, query json), notificationPreferences (userId, channel, eventType, enabled), unsubscribeTokens, notifications (userId, type, payload json, readAt), notificationQueue (jobKey unique, channel, recipientUserId, eventType, subject, payload, status pending|processing|sent|failed|dead, retryCount, backoffUntil, lastError), emailSendLog, digestRuns (savedSearchId, userId, frequency daily|weekly, windowStart, windowEnd, status, jobsSent), digestSent (digestRunId, jobId) — the dedup ledger.

### To build (Phase 3)
1. db.ts: extend ATS — employerGetApplicationsForJob(jobId, status filter, keyset), candidateApplicationDetail (app + stage history + unread counts), bulkMove (multiple app ids), conversationGet(applicationId, markRead), getUnreadCountForApp, withdrawal (candidate), getMyProfileViewCount, employerMember authorization helper (getCompanyMemberByUserId).
2. New router file server/routers/ats.ts: applications.board (kanban data grouped by stage w/ stats per stage), applications.move (with authz: only company member of the job's company), applications.withdraw (candidate owns profile), applications.history, applications.conversation (list+send), applications.unreadCounts, applications.detail.
3. UI: /employer/job/:id/kanban — KanbanBoard (6 columns applied/screening/interview/offered/accepted/rejected, move buttons dropdown per card), application card w/ candidate name, location, score if available; detail drawer with stage timeline + conversation thread; candidate dashboard shows profile views count + application statuses.
4. UI: JobDetail: apply flow exists; add cover letter.

### To build (Phase 4)
1. db.ts: enqueueNotification({channel, recipientUserId, eventType, subject?, payload, jobKey}), processQueue (dequeue pending, exponential backoff maxRetry 5→dead), enqueueApplicationEvent (new application → employer members; stage change → candidate; new message → other party; profile view → candidate optionally), digest helpers: buildDigestWindow, runDigest(savedSearchId, frequency, windowStart, windowEnd): query jobs ranked + dedup via digestSent ledger, queue notification rows, insert digestRuns row + digestSent rows, mark run completed.
2. Email transport: Resend if RESEND_API_KEY env, else logged_only (use webdev_owner_notifications skill? No — use forge notification api for owner only; for users use notificationQueue w/ Resend or no-op). Read /home/ubuntu/skills/webdev-periodic-updates/SKILL.md + webdev-owner-notifications.
3. Heartbeat crons: processQueue every minute; daily digest at 08:00; weekly digest Monday 08:00.
4. SavedSearch UI: candidate dashboard "Saved searches" panel (save current URL filters, name, daily/weekly toggle), notifications centre (in-app list, badge in SiteLayout nav).
5. Unsubscribe tokenized one-click: endpoint /api/trpc/public.unsubscribe?token=... (publicProcedure, marks usedAt, disables email preference).

### Testing/delivery
- Vitest: scoring, queue retry/DLQ/idempotency (test enqueue with same jobKey twice; retryCount/backoffUntil; dead at retry 5), E2E router callers (search→apply→move→notify).
- tsc green, pnpm test green, checkpoint, ZIP deliverable (downloadable via Management UI or export files to zip manually via shell into /home/ubuntu/hirewise-export.zip incl server, client, drizzle, shared, scripts, todo).

### Gotchas
- TiDB prepared-statement bug: never do `? * (CASE ...)`, no SIMILARITY_CAND, aliases fixed (use js4 for jobSkills subquery), titleOr reduce must be initialized properly.
- Data enrichment done (scripts/enrich2.mjs); enrichment is idempotent in seed.mjs edits.
- Dev server logs: .manus-logs/devserver.log; use curl to test endpoints.

## Heartbeat / periodic-updates findings (skill read)
- Cron handlers: HTTP POST to /api/scheduled/<name>, auth via sdk.authenticateRequest(req) → user.isCron && user.taskUid. Handler MUST be idempotent, 2-min timeout, 6-field cron `sec min hour * * *` UTC.
- Project-level Heartbeat (no end-user) created via sandbox CLI: `manus-heartbeat create --name X --cron "0 0 8 * * *" --path /api/scheduled/digest-daily --description "..."`. Owner identity. List with `manus-heartbeat list`.
- server/_core/heartbeat.ts exists in this project; legacy patches likely already applied (check server/_core/sdk.ts for CRON_OPEN_ID_PREFIX and types/manusTypes.ts taskUid).
- Express handler must be explicitly mounted in server/_core/index.ts before Vite fallthrough: app.post("/api/scheduled/...", handler).
- Handlers: try/catch, JSON-encode error on 500 (platform Investigate surfaces it).
- Plan: implement /api/scheduled/processQueue (cron idempotent: dequeue pending rows with backoffUntil <= now, try send, retryCount++ & backoffUntil exponential (min 60s, max ~6h), status dead after retryCount >= 5); /api/scheduled/digest-daily + /api/scheduled/digest-weekly. Create crons via manus-heartbeat CLI after checkpoint+publish. For dev, the scheduled endpoints can also be invoked manually.
- Email transport: Resend if RESEND_API_KEY; else logged_only (write emailSendLog row). No RESEND key likely — use no-op logger.
- Digest flow: for each savedSearch with active digest (check notificationPreferences/savedSearches; simplest: iterate all savedSearches where user pref in_app OR email enabled for 'digest'), compute window [now-window, now] (daily=24h, weekly=7d), run rankedSearchJobs for that query, filter out jobs already in digestSent for this savedSearch, build digestRuns row + digestSent rows, enqueue notification row (payload = job ids/summary), mark run completed.
- Event-driven enqueue (no heartbeat): new application → notify employer members (in_app); stage change → candidate (in_app + email if pref); new message → other party (in_app); profile view → candidate (in_app, optional).

## db.ts existing helpers for Phase 3/4
- db.getJobApplications(jobId): returns app rows + profile + topSkills + location.
- db.updateApplicationStatus(appId, status): direct update (no events!) — should be replaced/superseded by db.moveApplication (has STAGE_TRANSITIONS + events) used by new kanban router.
- db.sendMessage, getThread, markMessagesRead, getUnreadCounts — all exist.
- db.getNotificationPrefs, setNotificationPref, getOrCreateUnsubscribeToken, unsubscribeByToken — exist.
- notificationQueue helpers NOT yet in db.ts (need to add: enqueueNotification, processQueue).
- employers.setApplicationStatus currently uses db.updateApplicationStatus (direct). New ATS router will use moveApplication + notify.
- requireCompanyMembership helper exists in employers.ts.
- users table has role + userType (candidate/employer?). candidateProfiles linked via userId. companyMembers links userId→companyId role owner/admin/member.

## Employer candidate matching UI plan (Phase 2 remaining)
- Add jobs.rankedCandidates? Simplest: employer dashboard page "find candidates" reuses rankedSearchJobs over candidateProfiles — but rankedSearchJobs is jobs-only. For Phase 2 completeness, skip separate candidate search; instead add "Top matches" to employer applications board using job skills. Consider low priority; todo item "Employer candidate search (job → candidates)" — implement as candidate list sorted by skill overlap for a given job in ATS board (candidateCard includes a match score computed server-side via a new helper rankedCandidatesForJob using same weights).

## Progress update (current session)
Phase 2 core + UI complete & checkpointed at a6ec0494. Facet multi-select counts verified via curl (react+remote → remote facet={remote:28}; other dims re-counted under filter). Todo updated accordingly.

DONE so far in this session:
- facets: jobs.facetCounts now takes active filters from OTHER dimensions (remotePolicy/seniority/minSalary/maxSalary); Jobs.tsx builds facetInput with union ranges; verified.
- candidateSearch router added in server/routers/jobs.ts (candidateSearchRouter.run: jobId required published, falls back to jobSkills; calls db.rankedSearchCandidates which already exists).
- savedSearches router added (list/save/delete using existing db.listSavedSearches / db.createSavedSearch / db.deleteSavedSearch(id, userId) — note param order!).
- db.getJobSkills helper added (used to be missing; earlier block with duplicates removed).
- server/routers.ts mounts candidateSearch + savedSearches at top level. tsc 0 errors.

NEXT STEPS:
1. UI: employer candidate search on job detail (CandidateSearch panel using candidateSearch.run) — add to employer job detail page.
2. UI: saved searches panel in candidate dashboard (list/save/delete + re-run button filling search URL) — candidate page file: client/src/pages/Candidate.tsx (check name).
3. Phase 3 ATS: server/routers/ats.ts (board: group applications by stage w/ stats; move via db.moveApplication; withdraw; history; conversation send/read; unread counts; notifications enqueue on stage change/message/apply) + UI /employer/job/:id/board (Kanban) + candidate app timeline + messaging drawer + profileView counter.
4. Phase 4: db.enqueueNotification / processQueue helpers; scheduled handlers in server/_core/index.ts (/api/scheduled/processQueue, /api/scheduled/digest-daily, /api/scheduled/digest-weekly); scheduled crons via manus-heartbeat CLI AFTER publish; digest pipeline in db (createDigestRun, addDigestSent jobs + notificationQueue enqueue, completeDigestRun; dedup via digestSent); in-app notification centre + badge in SiteLayout; prefs + unsubscribe public endpoint.
5. Docs: docs/ranking.md + docs/decisions (8+ ADRs) + README update.
6. Vitest: scoring, alias, queue retry/DLQ/idempotency, E2E search→apply→stage→notify. Then pnpm test + tsc, checkpoint, ZIP (scripts: build zip incl server, client/src, drizzle, shared, scripts, todo.md, docs, README; exclude node_modules/dist/.git).

Key API names: db.moveApplication(appId, toStatus, actorUserId, note?), db.STAGE_TRANSITIONS; db.sendMessage(appId, senderUserId, text); db.getThread(appId); db.markMessagesRead(appId, forUserId); db.getUnreadCounts(appIds, forUserId); db.getJobApplications(jobId); db.applyToJob(jobId, profileId, coverNote); db.recordProfileView(employerUserId, profileId); db.getProfileViewCount(profileId); db.getNotificationPrefs(userId, channel, eventType); db.enqueueNotification (TO ADD); digestHelpers: createDigestRun etc at server/db.ts ~1310-1340 (completeDigestRun, failDigestRun exist there).
RANKING_WEIGHTS in shared/ranking.ts; db.rankedSearchJobs & db.facetCountsForJobs; db.rankedSearchCandidates (uses numericInList w/ literals — ok).
Note: db.ts already has Phase-4 scaffolding partially (digestRuns helpers + reports moderation at 1360+). check lines 1300-1340 for digest run helpers before writing Phase 4.
Design: UI pages: Jobs.tsx, Candidate.tsx(?), Employer.tsx(?), JobDetail.tsx(?), Home.tsx, NotFound.tsx in client/src/pages/. SiteLayout top nav with role-based links.

## JobApplications.tsx structure (181 lines) — Phase 3 kanban base
Pages: Home, Jobs, JobDetail (164), CandidateDashboard (175), ProfileBuilder, EmployerDashboard (203), JobApplications (181), CompanyCreate, CompanyPublic, ComponentShowcase, NotFound. App.tsx routes: /, /jobs, /jobs/:id, /candidate, /candidate/profile, /employer, /employer/job/:id/applications, /company/create, /company/:id.
JobApplications.tsx: uses employers.getJob({jobId}), employers.jobApplications({jobId}) (returns app+profile+topSkills+location), employers.setApplicationStatus({applicationId,status}) mutation w/ optimistic update, match % computed client-side from required skills, sort newest|match, DropdownMenu "Move pipeline" listing all 6 statuses. Imports: useAuth, SiteLayout, Button, Card, Badge, Skeleton, Select, DropdownMenu, trpc, lucide (ArrowLeft, ArrowUpDown, Building2, GraduationCap, UserCheck), wouter useRoute, toast.
STATUS_STYLES map, PROFI_ORDER map. Candidate card fields: a.profile.headline/currentTitle/profileId, a.status badge, a.location.city/country, a.profile.yearsOfExperience, a.profile.currentTitle, a.coverNote, a.topSkills[{name,proficiency}].
PLAN for Phase 3 UI: rebuild JobApplications page as kanban: 6 stage columns (applied, screening, interview, offered, accepted, rejected) w/ stats chips, cards in columns, Move dropdown per card, note on move (simple Dialog), message thread Dialog per card (conversation), stage history timeline in detail dialog. Also add candidate search panel: use candidateSearch.run.query({jobId, pageSize:20}) + skills.namesByIds.
CandidateDashboard.tsx: check for myApplications section + add profile views counter (candidates.profileViews.query) + stage timeline per application (applications.history).
EmployerDashboard.tsx: 203 lines; may add ATS links.
SiteLayout top nav: check where profile/views count lives; add notification bell w/ badge (applications.notices / notifications.centre).
Key: applications.history, applications.conversation {list,messages}, applications.withdraw, applications.move — all to add in ats.ts router w/ authz (company member for move/conv-employer side; profile owner for withdraw).
Authz pattern in employers.ts: requireCompanyMembership(ctx) throws if none; job.companyId === membership.companyId check.
db.ts has notificationQueue helpers? NOT yet (checked earlier) — add enqueueNotification, processQueue (dequeue w/ backoffUntil<=now, optimistic locking status pending→processing, send in_app insert + email no-op/Resend, sent|failed w/ retryCount++, dead after >=5).

## Phase 3-4 backend status (this session)
DONE (files created/edited):
- server/routers/ats.ts: history, move (enqueues stage_changed email+in_app via applicantUserId/employerUserId helpers), withdraw, conversation (auto marks read), sendMessage (enqueues application.message to other party via employerUserId=getCompanyOwner(companyId)/applicantUserId), unreadCounts, recordProfileView (enqueues profile.viewed to profile.userId), profileViewCount (own only), spamScore (exported spamScoreJob heuristic), reportTarget, reports/resolveReport (admin).
- server/routers/notifications.ts: centre, unreadCount, markRead, markAllRead, prefs.get/set, unsubscribe (public).
- server/routers/digests.ts: runScheduled (public worker), myRuns, queueStats/deadLetters (admin).
- server/routers/queue.ts: processQueue worker (claim→dispatch→Resend if RESEND_API_KEY else logged_only→backoff/dead via markQueueFailed which bumps retryCount itself!). queueStats.
- server/db.ts additions: getCompanyOwner(companyId); listDigestRuns; listDeadQueueRows; runAllScheduledDigests (loops savedSearches × daily/weekly, creates run, findMatchingJobsForDigest, enqueueNotification email+in_app per job, recordDigestSent, completeDigestRun).
- NOTE: queue.ts currently MISSING helper getUsersByIds — MUST add to db.ts: select {id,email} from users where inArray. Also fix 'res possibly undefined' ts18048 in fetch chain (declare res: Response = await fetch(...)).
- markQueueFailed already increments retryCount internally — queue.ts passed `Number(row.retryCount)+1` which double-increments! Check db.ts markQueueFailed: `retryCount = retryCount + 1` — so router must pass Number(row.retryCount) (original value). FIX: pass Number(row.retryCount ?? 0).
- TODO: mount routers: ats, notifications, digests, queue in server/routers.ts.
- TODO: scheduled/heartbeat hooks in server/_core/index.ts: /api/scheduled/processQueue (public), /api/scheduled/digest-daily (public), /api/scheduled/digest-weekly (public) → call queue.processQueue / digests.runScheduled via router callers (use tRPC createCaller? simpler: import db functions directly + appRouter via createTRPCContext? Use db functions directly). Also register via manus-heartbeat CLI? The periodic-updates skill says Heartbeat crons POST to /api/scheduled/<name>; add public JSON routes.
- TODO Phase 3 UI: kanban in JobApplications.tsx (6 cols, move dropdown + note, conversation Dialog, history timeline Dialog), candidateSearch panel on employer job page, messaging on candidate app cards (CandidateDashboard), unread badge, profile views counter, SiteLayout notification bell (notifications.unreadCount + centre Dialog), saved searches (CandidateDashboard: list/save/delete + re-run fills /jobs URL), admin moderation (new page /admin? reports + queueStats + deadLetters, nav link only for role=admin), unsubscribe page (/unsubscribe/:token public page).
- db helpers verified: listSavedSearches, createSavedSearch(userId,name,query)→id, deleteSavedSearch(id,userId)→bool; enqueueNotification {jobKey,channel,recipientUserId,eventType,subject?,payload} (channel=email ALSO inserts in_app notification; channel=in_app only queue row). notification types/subjects free-form.
- STAGE_TRANSITIONS defined in db.ts (applied→screening/interview/rejected/withdrawn etc.). backward moves NOT allowed! Spec says "backward moves preserve history" → current disallows. Consider allowing all moves? Phase 3 todo says backward moves preserve history. Update STAGE_TRANSITIONS to allow all forward+backward to terminal? Keep withdrawn only from non-terminal. Update moveApplication: allow any target except withdrawn-only? Implement: allow transition if app.status===toStatus (noop) or toStatus !== current; allowed if (toStatus==='withdrawn') or (current!=='withdrawn' && current!=='accepted' and ...). Simplest: allow any move to any of the 7 statuses except: cannot leave withdrawn/accepted? Decide: allow any status change (all transitions) — history records everything; employer can undo. Withdrawn can be reactivated by candidate only? Keep: employer can move to anything but withdrawn; withdrawn only by candidate withdraw.
- ATS UI JobApplications.tsx restructure: keep existing list? Replace with kanban grid (6 cols responsive). Cards: profile headline, match %, skills, location, years, cover note, move dropdown w/ note input (Dialog + Input), message thread (Sheet/Dialog w/ getThread auto-marks read, send message), history timeline (Dialog w/ stage events).

## GAPS to fix before delivery (system reminder)
1. UNIQUE constraint on applications(jobId, profileId): add drizzle .unique() → generate migration → webdev_execute_sql; verify duplicate apply blocked.
2. Backward ATS moves: STAGE_TRANSITIONS in db.ts currently forward-only. Spec: backward moves preserve history. Change moveApplication: allow any move (including backward) EXCEPT leave 'withdrawn' unless actor is candidate? Simplest: allow all transitions between the 7 statuses when actor does move; history always appended; withdrawn→reapply by moving back to applied. Keep employer cannot move to 'withdrawn' (only candidate). Update ats.move: candidate can move to applied/screening/interview/offered (reactivate from withdrawn); employer can move to any status except withdrawn; withdraw stays candidate-only. Update STAGE_TRANSITIONS usage (history records fromStatus/toStatus always).
3. Polling UI: Conversation dialog should poll trpc.ats.conversation every N seconds (useRef interval, 5s) while open; add ADR doc docs/decisions/adr-00X-polling-vs-sse.md.
4. Admin moderation UI: new page /admin (role=admin gate) showing reports (resolve/dismiss) + queue stats + dead letters; nav link only for admin. Also wire spamScore into PostJobDialog (preview badge on create/update).
5. Candidate dashboard timeline: show application status timeline (stage history) + profile view counter (ats.profileViewCount) + employer views count.
6. Employer candidate search panel UI: already have API (candidateSearch + savedSearches); add panel on employer job page? JobApplications page can have tabs: Board + Candidates. Implement candidate list tab with apply button + saved search.
7. Notification bell in SiteLayout: unreadCount query + badge + Dialog centre + mark read/mark all.
8. Saved searches UI: CandidateDashboard: list saved searches, re-run (navigate /jobs with query), delete.
9. Public unsubscribe page (/unsubscribe/:token) — link in email footer.
10. Re-seed idempotency check, docs (ranking.md + perf + ADRs + README 10-min), vitest additions, pnpm test + tsc + ZIP.
11. Employer candidate search UI on jobApplications page (CandidateSearchPanel) — uses candidateSearchRouter + skillsRouter.namesByIds.

## Key API surface (router paths)
- trpc.ats.history/move/withdraw/conversation/sendMessage/unreadCounts/recordProfileView/profileViewCount/spamScore/reports/resolveReport/reportTarget
- trpc.notifications.centre/unreadCount/markRead/markAllRead/prefs/setPref/unsubscribe
- trpc.digests.runScheduled/myRuns/queueStats/deadLetters
- trpc.queue.processQueue/queueStats
- trpc.candidateSearch.ranked / trpc.savedSearches.list/save/delete/rerun
- scheduled: POST /api/scheduled/processQueue, POST /api/scheduled/digests (public, Heartbeat cron will hit these)
- STAGE_TRANSITIONS: db.ts line ~1026 (now after edits). moveApplication(id,toStatus,actorUserId,note).
- db helpers: getStageHistory, getApplicationById, recordProfileView, getProfileViewCount, sendMessage, getThread, markMessagesRead, getUnreadCounts, listSavedSearches(userId), createSavedSearch(userId,name,query), deleteSavedSearch(id,userId).

## Design tokens
Fraunces display + Inter + JetBrains Mono; ink-navy oklch palette; amber accents; utilities: .ink-surface, .card-lift, .skill-chip, .rise-in.

## Phase 3-4 UI status (Aug 12 ~06:30 UTC)
- JobApplications.tsx: full kanban rebuilt (6 columns + withdrawn details block), Move dropdown→ats.move (note Dialog), Mail→conversation Dialog w/ 5s polling + optimistic send + read states, History Dialog (stage timeline), match% + unread badges, sort match/newest. Renders 200. tsc 0 errors.
- CandidateDashboard.tsx: added ProfileViewsCard (ats.profileViewCount), StageTimeline Dialog via History button per application, SavedSearchesPanel (list/delete; Save-current-search button shows whenever URL has filters q/remote/seniority/minSalary/maxSalary — page-agnostic). tsc 0 errors.
- SiteLayout.tsx: added <NotificationCentre /> bell before profile DropdownMenu (md+).
- NotificationCentre.tsx: CREATED (bell button + badge from notifications.unreadCount, Dialog list, markRead/markAll, 15s count refetch). tsc 0 errors.
- REMAINING: Unsubscribe page (/unsubscribe/:token), Admin page (/admin: reports + queueStats/deadLetters), candidateSearch panel on /employer/job/:id/applications, register routes in App.tsx, docs/, vitest additions, re-seed idempotency check, pnpm test, checkpoint, ZIP.
- Test user: 10150000 (candidate, openId 65XVwZ3rvE37UR5wENnpCq).

## Remaining gaps (from system reminder, Aug 12 ~06:35 UTC)
1. Saved-search naming + re-run UX/API: router supports name+query save+list+delete but NO re-run procedure and dashboard UI has no Run button. Fix: add `run: protectedProcedure.input({id}).query(...)` → read savedSearch.query and call rankedSearchJobs with it; UI: add Run button + name input when saving in SavedSearchesPanel.
2. Admin failure-rate metric: getQueueStats returns pending/processing/failed/dead/sent counts; add failureRate = (failed+dead)/(sent+failed+dead) in queueStats or client. UI should show failure rate.
3. Structured logging helper: no logEvent exists. Add `logEvent(level, msg, meta)` helper in server/db.ts (console.log JSON line + file?) and use in queue/dispatch + digest paths. Keep simple: JSON line to console.
4. Homepage hero still says "PHASE 1" — update Home.tsx to cover Phases 1-4 (ranked search, ATS kanban, messaging, notifications). Update footer already done.
5. Docs: docs/ranking.md + docs/perf/ (EXPLAIN ANALYZE page1/page50 of jobs.ranked query, timings, index list), docs/decisions/ 8+ ADRs (polling-vs-SSE, no-FULLTEXT-TiDB, TiDB-PS-CASE-bug, consent-gated-parsing, immutable-stage-history, keyset-pagination, weighted-single-SQL, digest-dedup), README 10-min Phases 1-4.
6. Vitest additions: scoring units, alias units, queue retry/DLQ/idempotency (same jobKey twice), E2E search→apply→move→notify.
7. Re-seed verification (idempotent run of seed.mjs after schema changes).
8. pnpm test + tsc green, checkpoint, ZIP delivery.

## API facts (for UI wiring)
- jobs.ranked input: { query?, skillIds?, locationId?, remotePolicy?, seniority?, minSalary?, maxSalary?, cursor?, pageSize? }
- savedSearches.query stores { query?, remotePolicy?, seniority?, minSalary?, maxSalary? } — same shape.
- jobs.facetCounts input: { query?, skillIds?, remotePolicy?, seniority?, minSalary?, maxSalary? }
- queueStats shape: { pending, processing, failed, dead, sent }.
- Test user: id 10150000 candidate. Admin gate: role='admin'.
- Scheduled endpoints: POST /api/scheduled/processQueue (batchSize?), /api/scheduled/digests — public, return 200.
- Home.tsx hero currently: "Phase 1 · Matching that actually means something", headline "Hire with a controlled vocabulary, not keyword roulette.", stats 5,100/2,100/22,000/439.
