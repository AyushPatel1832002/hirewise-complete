# ADR 005 — Consent-gated resume parsing (never silent writes)

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 1

## Context

Resume PDF extraction (pdfjs text extraction plus pattern-based parsing of work history, education, and skills) is inherently unreliable. Silently writing extraction results into a candidate's profile would quietly corrupt data the candidate owns.

## Decision

Extraction output is stored only as **`ResumeParseSuggestion` rows** with status `pending`. The UI presents each suggestion as a confirmation card; only confirmed suggestions become profile data via `applyConfirmedSuggestion`, which re-validates the pending status before writing.

## Consequences

**Positive:** the profile is never polluted by bad extraction; candidates keep full ownership; the pending queue doubles as a moderation surface.

**Negative:** extra UI steps and server round trips; extraction can only ever be a suggestion engine, never automation. Accepted as the correct product trade-off: reliability beats convenience for identity data.
