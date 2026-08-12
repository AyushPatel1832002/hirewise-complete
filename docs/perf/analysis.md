# Performance Analysis — `jobs.ranked` on production data

**Author:** Manus AI · **Date:** August 12, 2026 · **Dataset:** 2,100 jobs, 5,100 profiles, 22,000 applications (TiDB)

## Method

The ranked search SQL was profiled with `EXPLAIN ANALYZE` at two depths: page 1 (`LIMIT 20`) and page 50 (`LIMIT 20 OFFSET 980`). Query: full five-dimension score for the token `react`, published jobs only.

## Results

| Metric | Page 1 | Page 50 |
|---|---|---|
| Total query time | 22.2 ms | 24.3 ms |
| TiKV coprocessor time | 20.2 ms (1 task) | 18.8 ms (2 tasks) |
| Keys scanned | 2,100 | 2,100 |
| Rows evaluated (TopN actRows) | 233 | 233 |
| Memory | 14.9 KB | 157.9 KB |
| RU consumed | 26.82 | 26.82 |

## Interpretation

TiDB pushes the `TopN` operator into the TiKV coprocessor, so the **order-by-limit is evaluated near the data**: only the top-K candidates per region travel across the network, not all matches. The 233 `actRows` reflect the subset of published jobs matching the text token, which the scoring expression evaluates. Page 50 costs marginally more memory (accumulating TopN candidates) but essentially the same latency and RU budget — consistent, predictable cost per page.

Because scoring is a computed expression, every candidate row is touched regardless of depth; on datasets much larger than 2,100 jobs the next optimization (documented in the ADRs) is a **keyset-cursor variant** — `WHERE (raw, id) < (? , ?) ... ORDER BY raw DESC, id DESC LIMIT 20` — which reads exactly 20 rows per page and keeps latency constant at any depth.

## Indexes supporting the pipeline

| Table | Index | Columns | Purpose |
|---|---|---|---|
| jobs | `idx_jobs_published` | published | published-gate filter |
| jobs | `idx_jobs_companyId` | companyId | employer dashboard lists |
| jobs | `idx_jobs_remote` | remotePolicy | remote facet filter |
| applications | `uq_app_job_profile` | jobId, profileId (unique) | duplicate-application guard |
| applications | `idx_applications_jobId` / `idx_applications_profileId` | — | kanban + candidate timeline lookups |
| notificationQueue | (unique jobKey) | jobKey | queue idempotency |

Fragment LIKE matching (`%token%`) cannot use B-tree indexes by design; this is the documented trade-off for running on TiDB without FULLTEXT (see `docs/decisions/003-no-fulltext-tidb.md`).
