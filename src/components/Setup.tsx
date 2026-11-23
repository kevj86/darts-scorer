import { useState } from 'react';
import type { GameType, InputMode } from '../logic/game';
import { load, save } from '../storage';
import { type Theme, loadTheme, saveTheme } from '../theme';

export interface SetupResult {
  names: string[];
  startScore: GameType;
  mode: InputMode;
}

interface Prefs {
  count: number;
  names: string[];
  startScore: GameType;
  mode: InputMode;
}

const PREFS_KEY = 'darts-scorer:prefs';
const defaults: Prefs = { count: 2, names: ['', '', '', ''], startScore: 501, mode: 'dart' };

export function Setup({ onStart }: { onStart: (r: SetupResult) => void }) {
  const [prefs, setPrefs] = useState<Prefs>(() => ({ ...defaults, ...load(PREFS_KEY, defaults) }));
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const pickTheme = (t: Theme) => {
    setTheme(t);
    saveTheme(t);
  };
  const update = (p: Partial<Prefs>) => setPrefs((prev) => ({ ...prev, ...p }));

  const start = () => {
    save(PREFS_KEY, prefs);
    const names = prefs.names.slice(0, prefs.count).map((n, i) => n.trim() || `Player ${i + 1}`);
    onStart({ names, startScore: prefs.startScore, mode: prefs.mode });
  };

  return (
    <main className="setup">
      <header className="brand">
        <Logo />
        <h1>
          Darts <span>Scorer</span>
        </h1>
      </header>

      <section className="field">
        <h2>Players</h2>
        <div className="segmented">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className={prefs.count === n ? 'on' : ''} onClick={() => update({ count: n })}>
              {n}
            </button>
          ))}
        </div>
        <div className="names">
          {Array.from({ length: prefs.count }, (_, i) => (
            <input
              key={i}
              value={prefs.names[i]}
              placeholder={`Player ${i + 1}`}
              maxLength={16}
              autoComplete="off"
              aria-label={`Player ${i + 1} name`}
              onChange={(e) => {
                const names = [...prefs.names];
                names[i] = e.target.value;
                update({ names });
              }}
            />
          ))}
        </div>
      </section>

      <section className="field">
        <h2>Game</h2>
        <div className="segmented big">
          {([301, 501] as const).map((g) => (
            <button key={g} className={prefs.startScore === g ? 'on' : ''} onClick={() => update({ startScore: g })}>
              {g}
            </button>
          ))}
        </div>
        <p className="hint">Double out. Single leg.</p>
      </section>

      <section className="field">
        <h2>Score entry</h2>
        <div className="segmented">
          <button className={prefs.mode === 'dart' ? 'on' : ''} onClick={() => update({ mode: 'dart' })}>
            Every dart
          </button>
          <button className={prefs.mode === 'total' ? 'on' : ''} onClick={() => update({ mode: 'total' })}>
            Turn total
          </button>
        </div>
      </section>

      <section className="field theme-row">
        <h2>Theme</h2>
        <button
          role="switch"
          aria-checked={theme === 'blue'}
          aria-label="Theme"
          className={`theme-switch ${theme}`}
          onClick={() => pickTheme(theme === 'green' ? 'blue' : 'green')}
        >
          <span className="knob" />
        </button>
      </section>

      <button className="primary start" onClick={start}>
        Game on
      </button>
    </main>
  );
}

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#000" stroke="var(--accent)" strokeWidth="3" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="var(--accent)" strokeWidth="5" />
      <circle cx="32" cy="32" r="9" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <circle cx="32" cy="32" r="4" fill="var(--accent)" />
    </svg>
  );
}
