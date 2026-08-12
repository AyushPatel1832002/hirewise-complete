# ADR 009 — Digest deduplication via a sent-jobs ledger

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 4

## Context

Saved-search digests (daily and weekly) alert candidates to new matching jobs. A naive implementation re-selects "jobs matching my search" on every run, so the same job reappears in every digest — spamming candidates and destroying trust.

## Decision

A **`digestRuns` ledger** records `(savedSearchId, userId, frequency, windowStart, windowEnd)`, and the digest query excludes any job already sent in a prior run for the same saved search. The `windowStart` advances from the previous run's end, so digests cover disjoint time ranges, and a job is never duplicated across daily or weekly digests for the same search.

## Consequences

**Positive:** strong no-duplicate guarantee that survives cron overlaps, worker restarts, and missed runs; candidates receive genuinely new alerts; unsubscribe tokens remain valid and scoped per-user.

**Negative:** digest construction requires the ledger lookup plus a per-user job query; historical digests cannot be "re-sent" without deleting ledger rows (a deliberate constraint — re-sending requires explicit admin intent).
