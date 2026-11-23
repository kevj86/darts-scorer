import { useState } from 'react';
import type { Dart, Multiplier } from '../logic/darts';

export function DartPad({ onDart, onBust, onUndo, canUndo }: { onDart: (d: Dart) => void; onBust: () => void; onUndo: () => void; canUndo: boolean }) {
  const [mult, setMult] = useState<Multiplier>(1);

  const hit = (n: number, m: Multiplier = mult) => {
    onDart({ n, m });
    setMult(1);
  };
  const toggle = (m: Multiplier) => setMult((cur) => (cur === m ? 1 : m));

  return (
    <div className="pad">
      <div className="pad-mods">
        <button className={`mod ${mult === 2 ? 'on' : ''}`} onClick={() => toggle(2)}>
          Double
        </button>
        <button className={`mod ${mult === 3 ? 'on' : ''}`} onClick={() => toggle(3)}>
          Treble
        </button>
      </div>
      <div className={`pad-grid ${mult === 2 ? 'dbl' : mult === 3 ? 'tbl' : ''}`}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => hit(n)}>
            {mult === 3 ? 'T' : mult === 2 ? 'D' : ''}
            {n}
          </button>
        ))}
      </div>
      <div className="pad-row">
        <button onClick={() => hit(25, 1)}>25</button>
        <button onClick={() => hit(25, 2)}>Bull</button>
        <button className="miss" onClick={() => hit(0, 1)}>
          Miss
        </button>
        <button className="bust" onClick={() => { setMult(1); onBust(); }}>
          Bust
        </button>
        <button className="undo" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
      </div>
    </div>
  );
}
