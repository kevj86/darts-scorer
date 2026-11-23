import { useEffect, useState } from 'react';
import { bestCheckout } from '../logic/checkout';
import { type Dart, dartLabel, dartScore } from '../logic/darts';
import {
  classifyTotal,
  enterTotal,
  type Game as GameState,
  type InputMode,
  minCheckoutDarts,
  playerStats,
  remaining,
  scoreAtTurnStart,
  throwDart,
} from '../logic/game';
import { DartPad } from './DartPad';
import { TotalPad } from './TotalPad';

interface Props {
  game: GameState;
  mode: InputMode;
  canUndo: boolean;
  onChange: (g: GameState) => void;
  onUndo: () => void;
  onMode: (m: InputMode) => void;
  onQuit: () => void;
  onRematch: () => void;
}

export function Game({ game, mode, canUndo, onChange, onUndo, onMode, onQuit, onRematch }: Props) {
  const [flash, setFlash] = useState<{ text: string; kind: 'bust' | 'big'; key: number } | null>(null);
  const [checkoutFor, setCheckoutFor] = useState<number | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1400);
    return () => clearTimeout(t);
  }, [flash]);

  const announce = (before: GameState, after: GameState) => {
    const p = before.current;
    if (after.players[p].visits.length > before.players[p].visits.length) {
      const v = after.players[p].visits.at(-1)!;
      if (v.bust) setFlash({ text: 'BUST', kind: 'bust', key: Date.now() });
      else if (v.points === 180) setFlash({ text: 'ONE HUNDRED AND EIGHTY!', kind: 'big', key: Date.now() });
      else if (v.points >= 100 && !v.checkout) setFlash({ text: `${v.points}`, kind: 'big', key: Date.now() });
    }
  };

  const apply = (next: GameState) => {
    announce(game, next);
    onChange(next);
  };

  const onDart = (d: Dart) => apply(throwDart(game, d));

  const onTotal = (t: number) => {
    if (classifyTotal(game, t) === 'checkout') {
      const min = minCheckoutDarts(t) ?? 3;
      if (min === 3) apply(enterTotal(game, t, 3));
      else setCheckoutFor(t);
      return;
    }
    apply(enterTotal(game, t));
  };

  const cur = game.current;
  const left = remaining(game, cur);
  const dartsLeft = mode === 'dart' ? 3 - game.turnDarts.length : 3;
  const checkout = game.winner === null ? bestCheckout(left, dartsLeft) : null;
  const turnTotal = game.turnDarts.reduce((a, d) => a + dartScore(d), 0);
  const cols = game.players.length;

  return (
    <main className="game">
      <header className="topbar">
        <button className="ghost" onClick={() => setConfirmQuit(true)} aria-label="Quit game">
          ✕
        </button>
        <div className="title">
          {game.startScore} <span>Double out</span>
        </div>
        <div className="mode-toggle">
          <button
            className={mode === 'dart' ? 'on' : ''}
            disabled={game.turnDarts.length > 0}
            onClick={() => onMode('dart')}
          >
            Dart
          </button>
          <button
            className={mode === 'total' ? 'on' : ''}
            disabled={game.turnDarts.length > 0}
            onClick={() => onMode('total')}
          >
            Total
          </button>
        </div>
      </header>

      <section className={`players cols-${cols}`}>
        {game.players.map((p, i) => {
          const s = playerStats(game, i);
          const last = p.visits.at(-1);
          const active = i === cur && game.winner === null;
          return (
            <article key={i} className={`player ${active ? 'active' : ''}`}>
              <div className="pname">{p.name}</div>
              <div className="pscore">{remaining(game, i)}</div>
              <div className="pstats">
                <span>
                  Avg <b>{s.average.toFixed(1)}</b>
                </span>
                <span>
                  Last <b className={last?.bust ? 'bust' : ''}>{last ? (last.bust ? 'Bust' : last.points) : '–'}</b>
                </span>
              </div>
              <div className="pdarts">{s.darts} darts</div>
            </article>
          );
        })}
      </section>

      <section className="turn">
        <div className="turn-head">
          <span className="who">{game.players[cur].name} to throw</span>
          {mode === 'dart' && <span className="turn-total">{turnTotal}</span>}
        </div>
        {mode === 'dart' && (
          <div className="slots">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`slot ${game.turnDarts[i] ? 'filled' : ''} ${i === game.turnDarts.length ? 'next' : ''}`}>
                {game.turnDarts[i] ? dartLabel(game.turnDarts[i]) : `Dart ${i + 1}`}
              </div>
            ))}
          </div>
        )}
        <div className={`checkout ${checkout ? 'on' : ''}`}>
          {checkout ? (
            <>
              <span className="label">Checkout</span>
              {checkout.map((d, i) => (
                <span key={i} className="chip">
                  {dartLabel(d)}
                </span>
              ))}
            </>
          ) : (
            <span className="label muted">
              {left <= 170 && left > 1 ? `No checkout with ${dartsLeft} dart${dartsLeft === 1 ? '' : 's'}` : `Scoring from ${scoreAtTurnStart(game, cur)}`}
            </span>
          )}
        </div>
      </section>

      {mode === 'dart' ? (
        <DartPad onDart={onDart} onUndo={onUndo} canUndo={canUndo} />
      ) : (
        <TotalPad onTotal={onTotal} onUndo={onUndo} canUndo={canUndo} />
      )}

      {flash && game.winner === null && (
        <div key={flash.key} className={`flash ${flash.kind}`}>
          {flash.text}
        </div>
      )}

      {checkoutFor !== null && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Checkout {checkoutFor}!</h2>
            <p>How many darts did it take?</p>
            <div className="segmented big">
              {[1, 2, 3]
                .filter((n) => n >= (minCheckoutDarts(checkoutFor) ?? 3))
                .map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      apply(enterTotal(game, checkoutFor, n));
                      setCheckoutFor(null);
                    }}
                  >
                    {n}
                  </button>
                ))}
            </div>
            <button className="ghost wide" onClick={() => setCheckoutFor(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {confirmQuit && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Quit this game?</h2>
            <p>The current scores will be lost.</p>
            <button className="primary wide" onClick={onQuit}>
              Quit to setup
            </button>
            <button className="ghost wide" onClick={() => setConfirmQuit(false)}>
              Keep playing
            </button>
          </div>
        </div>
      )}

      {game.winner !== null && <Winner game={game} onRematch={onRematch} onQuit={onQuit} onUndo={onUndo} />}
    </main>
  );
}

function Winner({ game, onRematch, onQuit, onUndo }: { game: GameState; onRematch: () => void; onQuit: () => void; onUndo: () => void }) {
  const w = game.winner!;
  const finish = game.players[w].visits.at(-1)!;
  return (
    <div className="modal-bg">
      <div className="modal winner">
        <div className="gameshot">Game shot!</div>
        <h2>{game.players[w].name} wins</h2>
        <p className="muted">
          Checked out {finish.points}
          {finish.thrown ? ` (${finish.thrown.map(dartLabel).join(', ')})` : ''} in {playerStats(game, w).darts} darts
        </p>
        <table className="stats">
          <thead>
            <tr>
              <th></th>
              <th>Avg</th>
              <th>Darts</th>
              <th>High</th>
              <th>100+</th>
              <th>140+</th>
              <th>180</th>
            </tr>
          </thead>
          <tbody>
            {game.players.map((p, i) => {
              const s = playerStats(game, i);
              return (
                <tr key={i} className={i === w ? 'win' : ''}>
                  <td>{p.name}</td>
                  <td>{s.average.toFixed(1)}</td>
                  <td>{s.darts}</td>
                  <td>{s.highest}</td>
                  <td>{s.tons}</td>
                  <td>{s.ton40s}</td>
                  <td>{s.max180s}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button className="primary wide" onClick={onRematch}>
          Rematch
        </button>
        <button className="ghost wide" onClick={onQuit}>
          New game
        </button>
        <button className="link" onClick={onUndo}>
          Undo checkout
        </button>
      </div>
    </div>
  );
}
