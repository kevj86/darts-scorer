import { type Dart, dartScore, isDouble } from './darts';
import { bestCheckout } from './checkout';

export type GameType = 301 | 501;
export type InputMode = 'dart' | 'total';

export interface Visit {
  points: number; // 0 when bust
  darts: number; // darts counted towards the average
  bust: boolean;
  checkout: boolean;
  thrown?: Dart[]; // per-dart detail when entered dart by dart
  attempted: number; // what was scored before the bust (for display)
}

export interface Player {
  name: string;
  visits: Visit[];
}

export interface Game {
  startScore: GameType;
  players: Player[];
  current: number;
  turnDarts: Dart[];
  winner: number | null;
  firstPlayer: number;
}

export function newGame(names: string[], startScore: GameType, firstPlayer = 0): Game {
  return {
    startScore,
    players: names.map((name) => ({ name, visits: [] })),
    current: firstPlayer % names.length,
    turnDarts: [],
    winner: null,
    firstPlayer: firstPlayer % names.length,
  };
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Score at the start of the current turn (ignores darts in progress). */
export function scoreAtTurnStart(game: Game, idx: number): number {
  return game.startScore - sum(game.players[idx].visits.map((v) => v.points));
}

/** Live remaining score including darts already thrown this turn. */
export function remaining(game: Game, idx: number): number {
  const base = scoreAtTurnStart(game, idx);
  return idx === game.current ? base - sum(game.turnDarts.map(dartScore)) : base;
}

export interface PlayerStats {
  average: number; // 3-dart average
  darts: number;
  points: number;
  highest: number;
  tons: number;
  ton40s: number;
  max180s: number;
}

export function playerStats(game: Game, idx: number): PlayerStats {
  const visits = game.players[idx].visits;
  let darts = sum(visits.map((v) => v.darts));
  let points = sum(visits.map((v) => v.points));
  if (idx === game.current && game.winner === null) {
    darts += game.turnDarts.length;
    points += sum(game.turnDarts.map(dartScore));
  }
  const scored = visits.filter((v) => !v.bust).map((v) => v.points);
  return {
    average: darts ? (points / darts) * 3 : 0,
    darts,
    points,
    highest: scored.length ? Math.max(...scored) : 0,
    tons: scored.filter((p) => p >= 100 && p < 140).length,
    ton40s: scored.filter((p) => p >= 140 && p < 180).length,
    max180s: scored.filter((p) => p === 180).length,
  };
}

function endTurn(game: Game, visit: Visit, won: boolean): Game {
  const players = game.players.map((p, i) =>
    i === game.current ? { ...p, visits: [...p.visits, visit] } : p,
  );
  return {
    ...game,
    players,
    turnDarts: [],
    winner: won ? game.current : null,
    current: won ? game.current : (game.current + 1) % game.players.length,
  };
}

/** Throw a single dart for the current player (double-out rules). */
export function throwDart(game: Game, dart: Dart): Game {
  if (game.winner !== null) return game;
  const start = scoreAtTurnStart(game, game.current);
  const darts = [...game.turnDarts, dart];
  const scored = sum(darts.map(dartScore));
  const left = start - scored;

  const bust = left < 0 || left === 1 || (left === 0 && !isDouble(dart));
  if (bust) {
    return endTurn(game, { points: 0, darts: 3, bust: true, checkout: false, thrown: darts, attempted: scored }, false);
  }
  if (left === 0) {
    return endTurn(game, { points: scored, darts: darts.length, bust: false, checkout: true, thrown: darts, attempted: scored }, true);
  }
  if (darts.length === 3) {
    return endTurn(game, { points: scored, darts: 3, bust: false, checkout: false, thrown: darts, attempted: scored }, false);
  }
  return { ...game, turnDarts: darts };
}

export type TotalResult = 'ok' | 'bust' | 'checkout';

/** What would entering this visit total do? */
export function classifyTotal(game: Game, total: number): TotalResult {
  const start = scoreAtTurnStart(game, game.current);
  const left = start - total;
  if (left === 0 && bestCheckout(start, 3)) return 'checkout';
  if (left <= 1) return 'bust';
  return 'ok';
}

/** Minimum darts needed to check out from `score` (1-3), or null. */
export function minCheckoutDarts(score: number): number | null {
  for (let d = 1; d <= 3; d++) if (bestCheckout(score, d)) return d;
  return null;
}

/** Enter a whole visit total. `checkoutDarts` is required when the total checks out. */
export function enterTotal(game: Game, total: number, checkoutDarts = 3): Game {
  if (game.winner !== null) return game;
  const result = classifyTotal(game, total);
  if (result === 'bust') {
    return endTurn(game, { points: 0, darts: 3, bust: true, checkout: false, attempted: total }, false);
  }
  if (result === 'checkout') {
    return endTurn(game, { points: total, darts: checkoutDarts, bust: false, checkout: true, attempted: total }, true);
  }
  return endTurn(game, { points: total, darts: 3, bust: false, checkout: false, attempted: total }, false);
}

/** Declare the current turn bust without entering the darts: score goes back to the start of the turn. */
export function declareBust(game: Game): Game {
  if (game.winner !== null) return game;
  const attempted = sum(game.turnDarts.map(dartScore));
  return endTurn(
    game,
    { points: 0, darts: 3, bust: true, checkout: false, thrown: game.turnDarts.length ? game.turnDarts : undefined, attempted },
    false,
  );
}
