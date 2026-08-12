/**
 * Ranking weights — ONE place to tune the entire scoring formula.
 * Every signal contributes to a raw 0-1 score via these weights (summing to 1),
 * then the composite is scaled to 0-100 for display.
 *
 * The design rationale lives in docs/ranking.md.
 */
export const RANKING_WEIGHTS = {
  /** Text relevance: title match is worth more than body match (setweight analogue). */
  text: {
    title: 0.35,
    body: 0.15,
  },
  /** Skill overlap. Required skills carry more weight than preferred. */
  skills: {
    required: 0.3,
    preferred: 0.1,
  },
  /** Geographic proximity (haversine km, clamped at maxDistanceKm). */
  distance: 0.1,
  /** Recency: newer jobs score higher; half-life days. */
  recency: 0.1,
  recencyHalfLifeDays: 30,
  /** Salary range compatibility. */
  salary: 0.1,
  /**
   * Beyond this distance (km) the distance signal is fully degraded.
   * Remote-friendly jobs (remote/flexible, or "Remote" location) bypass this
   * and take the full distance score.
   */
  maxDistanceKm: 3000,
  /** Typo-tolerance fallback activates when the exact tier returns fewer rows than this. */
  typoFallbackMinResults: 3,
} as const;

export type RankingWeights = typeof RANKING_WEIGHTS;

export const MAX_SCORE = 100;

/**
 * Text-similarity helper for the typo-tolerance tier.
 * Simple bigram-overlap similarity (a poor man's pg_trgm) computed in SQL as:
 *   2 * |bigrams(a) ∩ bigrams(b)| / (|bigrams(a)| + |bigrams(b)|)
 * Implemented server-side over small token sets only.
 */
export function bigramSimilarity(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let overlap = 0;
  for (const k of Array.from(A)) if (B.has(k)) overlap++;
  return (2 * overlap) / (A.size + B.size);
}

function bigrams(s: string): Set<string> {
  const norm = s.toLowerCase().trim();
  const out = new Set<string>();
  for (let i = 0; i < norm.length - 1; i++) out.add(norm.slice(i, i + 2));
  return out;
}
