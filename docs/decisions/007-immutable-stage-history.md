# ADR 007 — Append-only immutable stage history for the ATS

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 3

## Context

Recruiters move candidates between six stages (applied, screening, interview, offer, hired, rejected) plus withdrawal. A single mutable `stage` column is simple but destroys auditability: a move back from "rejected" to "screening" would be invisible, and stage-change timestamps could be silently overwritten.

## Decision

Stage changes are stored as **`ApplicationStageEvent` rows** that are never updated or deleted. The current stage is always **derived from the latest event** (`ats.history` orders by `id DESC`). Backward moves (e.g., rejected → screening) are allowed but append their own event. Withdrawal appends a `withdrawn` event and the kanban collapses withdrawn cards.

## Consequences

**Positive:** complete, tamper-evident timeline for every application; the history doubles as the candidate-facing status timeline and as an audit surface for moderation; re-deriving stage from events eliminates a whole class of consistency bugs (no more stale `stage` column to resync).

**Negative:** every stage read carries a join/subquery over events (indexed by application id, cheap at 22,000 applications); stage aggregates require grouping over events rather than a simple column filter.
