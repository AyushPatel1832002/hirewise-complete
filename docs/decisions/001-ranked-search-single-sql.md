# ADR 001 — Single-SQL ranked scoring instead of application-level ranking

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 2

## Context

Candidates search 2,100 jobs across five relevance dimensions (text, skills, geography, recency, salary). The product requires an explainable 0–100 score with a per-result breakdown, faceted counts, and keyset pagination.

## Decision

All scoring is expressed in **one SQL statement** executed by `rankedSearchJobs`, returning raw component columns alongside the composite score. Application-level ranking (pulling candidate rows into Node and scoring in JS) was rejected.

## Consequences

**Positive:** one round trip per page; TopN pushdown to TiKV makes cost per page constant (verified 22–24 ms at pages 1 and 50); the breakdown is free because components are selected directly; filters can reuse the same statement family.

**Negative:** scoring logic lives in SQL strings, harder to unit-test than plain functions (mitigated by pure-unit tests of the weight computation and shared constants in `shared/ranking.ts`); expression changes require SQL-level care with prepared statements (see ADR 004).
