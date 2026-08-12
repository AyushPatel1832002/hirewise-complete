# ADR 004 — Weight multiplication inside CASE branches (TiDB prepared-statement workaround)

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 2

## Context

Two prepared-statement failures were observed in production on TiDB:

1. `? * (CASE WHEN ... THEN ? ELSE 0 END)` — the parser mis-parses the weight placeholder preceding a `CASE` expression, emitting malformed SQL (blank `CASE WHEN THEN ?` fragments in the server log).
2. Empty token lists produced `CASE WHEN  THEN ?` — an empty condition that is invalid SQL.

## Decision

All weight multiplications were moved **inside** the `CASE` branches (`CASE WHEN cond THEN ? * value ELSE 0 END`), every branch has an explicit numeric fallback (title/body exact branches default to the `0=1` sentinel when no tokens exist), and `NULL` paths in distance/salary arithmetic are guarded with `COALESCE` and `IFNULL`.

## Consequences

**Positive:** every generated statement is syntactically valid for every input combination (empty query, skill-only query, null location), verified by a dedicated fix checkpoint; scoring remains identical because multiplication is commutative within branches.

**Negative:** the SQL builder is more verbose and order-sensitive; a future refactor into a small builder library would reduce risk when adding dimensions.
