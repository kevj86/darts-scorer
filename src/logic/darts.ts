export type Multiplier = 1 | 2 | 3;

/** A single dart. n = 0 is a miss, n = 25 is the bull (outer 25 / inner 50). */
export interface Dart {
  n: number;
  m: Multiplier;
}

export const dartScore = (d: Dart): number => d.n * d.m;
export const isDouble = (d: Dart): boolean => d.m === 2 && d.n > 0;

export function dartLabel(d: Dart): string {
  if (d.n === 0) return 'Miss';
  if (d.n === 25) return d.m === 2 ? 'Bull' : '25';
  if (d.m === 3) return `T${d.n}`;
  if (d.m === 2) return `D${d.n}`;
  return `${d.n}`;
}

/** Totals that cannot be scored with three darts. */
export const IMPOSSIBLE_VISITS = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);

export function isPossibleVisit(total: number): boolean {
  return Number.isInteger(total) && total >= 0 && total <= 180 && !IMPOSSIBLE_VISITS.has(total);
}
