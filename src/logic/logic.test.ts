import { describe, expect, it } from 'vitest';
import { bestCheckout } from './checkout';
import { dartLabel, dartScore, type Dart } from './darts';
import { enterTotal, newGame, playerStats, remaining, throwDart } from './game';

const labels = (ds: Dart[] | null) => ds?.map(dartLabel).join(' ') ?? null;
const t = (n: number): Dart => ({ n, m: 3 });
const d = (n: number): Dart => ({ n, m: 2 });
const s = (n: number): Dart => ({ n, m: 1 });

describe('bestCheckout', () => {
  it('finds classic finishes', () => {
    expect(labels(bestCheckout(170, 3))).toBe('T20 T20 Bull');
    expect(labels(bestCheckout(167, 3))).toBe('T20 T19 Bull');
    expect(labels(bestCheckout(100, 3))).toBe('T20 D20');
    expect(labels(bestCheckout(40, 3))).toBe('D20');
    expect(labels(bestCheckout(32, 1))).toBe('D16');
    expect(labels(bestCheckout(50, 1))).toBe('Bull');
    expect(labels(bestCheckout(2, 1))).toBe('D1');
  });
  it('returns null for bogey numbers and impossible situations', () => {
    for (const n of [169, 168, 166, 165, 163, 162, 159, 171, 1, 0]) expect(bestCheckout(n, 3)).toBeNull();
    expect(bestCheckout(100, 1)).toBeNull();
    expect(bestCheckout(41, 1)).toBeNull();
  });
  it('every finish from 2..170 is valid and ends on a double', () => {
    for (let n = 2; n <= 170; n++) {
      const c = bestCheckout(n, 3);
      if (!c) continue;
      expect(c.reduce((a, x) => a + dartScore(x), 0)).toBe(n);
      expect(c[c.length - 1].m).toBe(2);
    }
  });
});

describe('game', () => {
  it('updates score dart by dart and passes turn after 3 darts', () => {
    let g = newGame(['A', 'B'], 501);
    g = throwDart(g, t(20));
    expect(remaining(g, 0)).toBe(441);
    g = throwDart(g, t(20));
    g = throwDart(g, t(20));
    expect(remaining(g, 0)).toBe(321);
    expect(g.current).toBe(1);
    expect(playerStats(g, 0).average).toBe(180);
  });

  it('busts back to the start-of-turn score', () => {
    let g = newGame(['A'], 301);
    g = { ...g, players: [{ name: 'A', visits: [{ points: 261, darts: 9, bust: false, checkout: false, attempted: 261 }] }] };
    expect(remaining(g, 0)).toBe(40);
    g = throwDart(g, s(20));
    expect(remaining(g, 0)).toBe(20);
    g = throwDart(g, s(19)); // leaves 1 => bust
    expect(remaining(g, 0)).toBe(40);
    expect(g.players[0].visits.at(-1)?.bust).toBe(true);
  });

  it('requires a double to finish', () => {
    let g = newGame(['A'], 301);
    g = { ...g, players: [{ name: 'A', visits: [{ points: 261, darts: 9, bust: false, checkout: false, attempted: 261 }] }] };
    g = throwDart(g, s(20));
    g = throwDart(g, s(20)); // 0 but not double => bust
    expect(g.winner).toBeNull();
    expect(remaining(g, 0)).toBe(40);
    g = throwDart(g, d(20));
    expect(g.winner).toBe(0);
    expect(playerStats(g, 0).darts).toBe(13);
  });

  it('handles visit totals including bust and checkout', () => {
    let g = newGame(['A', 'B'], 301);
    g = enterTotal(g, 140);
    g = enterTotal(g, 60);
    expect(remaining(g, 0)).toBe(161);
    g = enterTotal(g, 170); // bust
    expect(remaining(g, 0)).toBe(161);
    g = enterTotal(g, 100);
    g = enterTotal(g, 161, 3);
    expect(g.winner).toBe(0);
  });
});
