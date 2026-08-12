# ADR 008 — Durable queue with retry, backoff, and dead-letter view

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 4

## Context

Platform events (application submitted, stage change, new message, profile viewed) must become notifications. Fire-and-forget dispatch would lose messages whenever the email transport fails; an in-memory queue would lose them on restart.

## Decision

A **`notification_queue` table** is the durable store. Workers claim batches (`claimQueueBatch` filters `status = 'pending' AND availableAt <= NOW()`), dispatch, and transition rows to `sent`, `failed`, or `dead`. Retries use **exponential backoff** (`MAX_RETRIES = 6`) and rows that exhaust retries are dead-lettered with their last error preserved for the admin view. The `jobKey` column is **unique**, making enqueueing and worker runs idempotent — re-processing never duplicates a notification.

## Consequences

**Positive:** no message is ever silently lost (failures degrade to `logged_only` and retry); the admin console reports depth and a **failure rate** `(failed + dead) / total`, and DLQ contents are inspectable; cron-triggered runs (every minute) mean failures heal themselves under transient transport outages.

**Negative:** every notification carries write latency to the queue table; at very high throughput a dedicated broker (Redis/SQS) would provide better throughput guarantees and visibility semantics.
