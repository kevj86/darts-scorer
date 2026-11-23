import { type Dart, dartScore } from './darts';

// Lower cost = preferred. Finishing doubles in rough order of how pros like them.
const DOUBLE_COST: Record<number, number> = {
  20: 0, 16: 0, 8: 1, 18: 1, 12: 1.5, 10: 1.5, 4: 2, 14: 2, 6: 2.5, 2: 3, 25: 3,
  11: 3.5, 13: 3.5, 15: 3.5, 17: 3.5, 19: 3.5, 9: 4, 7: 4, 5: 4, 3: 4.5, 1: 6,
};

// Cost of a set-up (non-finishing) dart.
function setupCost(d: Dart): number {
  if (d.n === 25) return d.m === 2 ? 3.5 : 2.5;
  if (d.m === 3) {
    if (d.n >= 19) return 0;
    if (d.n >= 17) return 0.5;
    if (d.n >= 15) return 1;
    if (d.n >= 10) return 1.5;
    return 3.5;
  }
  if (d.m === 2) return 6; // doubles as set-up darts are unusual
  return d.n >= 10 ? 1 : 1.25; // singles: big fat targets
}

const SETUP_DARTS: Dart[] = [];
for (let n = 20; n >= 1; n--) SETUP_DARTS.push({ n, m: 3 });
SETUP_DARTS.push({ n: 25, m: 2 }, { n: 25, m: 1 });
for (let n = 20; n >= 1; n--) SETUP_DARTS.push({ n, m: 1 });
for (let n = 20; n >= 1; n--) SETUP_DARTS.push({ n, m: 2 });

const FINISH_DARTS: Dart[] = [];
for (let n = 20; n >= 1; n--) FINISH_DARTS.push({ n, m: 2 });
FINISH_DARTS.push({ n: 25, m: 2 });

const cache = new Map<string, Dart[] | null>();

/**
 * Best double-out checkout for `remaining` using at most `dartsLeft` darts,
 * or null if it cannot be finished this turn.
 */
export function bestCheckout(remaining: number, dartsLeft: number): Dart[] | null {
  if (dartsLeft < 1 || remaining < 2 || remaining > 170) return null;
  const key = `${remaining}:${dartsLeft}`;
  if (cache.has(key)) return cache.get(key)!;

  let result: Dart[] | null = null;
  for (let darts = 1; darts <= dartsLeft && !result; darts++) {
    let bestCost = Infinity;
    for (const finish of FINISH_DARTS) {
      const need = remaining - dartScore(finish);
      if (need < 0) continue;
      const finishCost = DOUBLE_COST[finish.n] * 1.5;
      if (darts === 1) {
        if (need === 0 && finishCost < bestCost) {
          bestCost = finishCost;
          result = [finish];
        }
        continue;
      }
      if (darts === 2) {
        for (const a of SETUP_DARTS) {
          if (dartScore(a) !== need) continue;
          const cost = finishCost + setupCost(a);
          if (cost < bestCost) {
            bestCost = cost;
            result = [a, finish];
          }
        }
        continue;
      }
      for (const a of SETUP_DARTS) {
        const rest = need - dartScore(a);
        if (rest <= 0) continue;
        for (const b of SETUP_DARTS) {
          if (dartScore(b) !== rest) continue;
          // second dart should ideally be no bigger a target than the first
          const cost = finishCost + setupCost(a) + setupCost(b) + (dartScore(b) > dartScore(a) ? 0.1 : 0);
          if (cost < bestCost) {
            bestCost = cost;
            result = [a, b, finish];
          }
        }
      }
    }
  }
  cache.set(key, result);
  return result;
}
