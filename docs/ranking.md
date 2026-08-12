# HireWise Ranked Search — Architecture & Scoring Reference

**Author:** Manus AI · **Last updated:** August 12, 2026

## 1. Purpose and constraints

HireWise ranks jobs for candidates (and candidates for jobs) with a **single SQL statement** that computes an explainable 0–100 match score. The engine runs on **TiDB**, a MySQL-compatible distributed database that **lacks FULLTEXT indexes** and imposes quirks on prepared statements for complex `CASE` expressions. The design therefore combines fragment-based LIKE matching, haversine geography computed in SQL, and a decoupled typo-tolerance fallback tier.

All scoring parameters live in one shared object, `shared/ranking.ts → RANKING_WEIGHTS`, so search UI, candidate search, and tests all read the same numbers.

## 2. Weight configuration

| Dimension | Weight | Notes |
|---|---|---|
| Text — title match | 0.35 | `LIKE '%token%'` on lowercased title |
| Text — body match | 0.15 | `LIKE '%token%'` on lowercased description |
| Skills — required overlap | 0.30 | share of a job's required skills the profile has |
| Skills — preferred overlap | 0.10 | share of preferred skills |
| Distance | 0.10 | haversine km, clamped at `maxDistanceKm` (default 5,000) |
| Recency | 0.10 | `POW(2, -ageDays / halfLife)`, half-life 30 days |
| Salary | 0.10 | band overlap between candidate range and job range |

The sum is 1.0; raw score × 100 yields the displayed 0–100 score. Remote-friendly jobs (remote/flexible policy or location named "Remote") take the full distance + salary components by default.

## 3. The query

The statement has four logical layers:

1. **Match filter** — `published = 1` plus a `LIKE` disjunction over title/description for the query tokens, plus optional facet filters (seniority, remote policy, salary band). When the text filter is empty and no skill filter applies, the condition collapses to `1=1` so all published jobs are browsable.
2. **Skill join** — left joins through `jobSkills`/`candidateSkills` resolve both sides through the alias table at query time (`SkillAlias`), so "JS", "Javascript", and "JavaScript" all count as the canonical JavaScript skill.
3. **Score expression** — one `SELECT` list expression sums the weighted components using `CASE` branches; weights are multiplied **inside** the branches because TiDB's prepared-statement parser rejects `? * (CASE ... END)` patterns.
4. **Ordering and keyset pagination** — `ORDER BY raw DESC, id DESC` with a composite cursor `(score, id)` returned as `nextCursor`.

Per-result columns `rawText`, `rawSkills`, `rawDistance`, `rawRecency`, `rawSalary` expose the breakdown, which the UI renders as a popover bar.

## 4. Typo tolerance

Because there is no trigram index, typo tolerance is a **two-tier strategy**:

- **Tier 1 (exact-ish):** LIKE fragments on lowercased text.
- **Tier 2 (fuzzy):** if tier 1 returns fewer than `typoFallbackMinResults` (3) matches, the server builds a bigram-similarity score (`2·|A∩B|/(|A|+|B|)`) between query tokens and candidate text fragments for skills, titles, and locations, and re-ranks rows whose similarity exceeds 0.4. Verified: `javascrpt` returns ~65 plausible results.

## 5. Faceted filters

Facet counts are computed per dimension. Crucially, when facets from **other** dimensions are active, counts are re-computed under those filters so users never see an empty-result dead end after selecting a facet. A facet's own dimension is excluded from its recount (multi-select semantics within a dimension).

## 6. Empty-query safety

Two prepared-statement hazards were discovered and fixed:

- **Blank `CASE WHEN  THEN ?`**: when a query resolves only to skills, the text tokens list is empty; title/body exact-match branches now default to a `0=1` sentinel instead of emitting an empty `CASE` condition.
- **NULL arithmetic**: `NULL / ?` inside `GREATEST` produced invalid statements; fragment defaults guard every branch so the SQL is always well-formed regardless of input.

## 7. Score normalization

Raw scores are multiplied by 100 and clamped to [0, 100] for display. Each raw component is already bounded to its own weight, so no post-hoc normalization is needed.

## 8. Files

| Path | Role |
|---|---|
| `shared/ranking.ts` | `RANKING_WEIGHTS`, `MAX_SCORE`, `bigramSimilarity` |
| `server/db.ts` | `rankedSearchJobs`, `rankedSearchCandidates`, `facetCounts`, alias resolution |
| `server/routers/search.ts` | `jobs.ranked`, `facetCounts`, `savedSearches.*` |
| `client/src/pages/Jobs.tsx` | Results UI, score pills, breakdown bars, URL-backed filters |
