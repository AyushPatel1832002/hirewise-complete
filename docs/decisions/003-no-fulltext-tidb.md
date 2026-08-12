# ADR 003 — Fragment LIKE matching instead of FULLTEXT indexes

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 2

## Context

TiDB does not support MySQL's FULLTEXT index with boolean-mode search, so the classic `MATCH(...) AGAINST(...)` relevance pattern is unavailable.

## Decision

Text relevance uses **lowercased fragment matching** — `LOWER(title) LIKE '%token%'` — combined with per-token weighting (title 0.35, body 0.15). Typo tolerance is a server-computed bigram-similarity fallback tier (similarity > 0.4, activated when the exact tier returns fewer than 3 results).

## Consequences

**Positive:** portable across MySQL-compatible engines; no extra index maintenance; behavior is deterministic and easy to reason about; verified to work on the seeded 2,100-job corpus ("react" → 227+ matches, "javascrpt" → ~65 fuzzy matches).

**Negative:** leading-wildcard LIKE cannot use B-tree indexes, so every candidate row is scanned and scored; acceptable at 2,100 rows (22 ms/query) but would require a materialized token table or an external search service (Meilisearch/Typesense) at materially larger scale.
