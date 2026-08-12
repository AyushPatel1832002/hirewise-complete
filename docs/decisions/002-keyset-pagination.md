# ADR 002 — Keyset pagination over offset pagination

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 2

## Context

Search results must page through thousands of scored rows. Classic `LIMIT/OFFSET` re-scans and re-sorts everything before the offset on every request, and pages can drift when data changes between requests.

## Decision

The API returns a **composite cursor `(score, id)`** after each page; the next request adds `WHERE (raw, id) < (?, ?) ORDER BY raw DESC, id DESC LIMIT 20`. The `id` tiebreaker makes the cursor stable under equal scores and concurrent inserts.

## Consequences

**Positive:** each page reads exactly 20 rows; page 50 costs the same as page 1; no duplicate/skipped rows under concurrent writes; cursor survives filter changes because filters are re-applied deterministically.

**Negative:** no "jump to page N" and no total count in one pass; the UI therefore uses a "Load more" pattern, which is acceptable for ranked search. Facet counts are computed separately.
