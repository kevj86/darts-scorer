import { useState } from 'react';
import { isPossibleVisit } from '../logic/darts';

const QUICK = [26, 41, 45, 60, 81, 85, 100, 140, 180];

export function TotalPad({ onTotal, onUndo, canUndo }: { onTotal: (t: number) => void; onUndo: () => void; canUndo: boolean }) {
  const [value, setValue] = useState('');
  const num = value === '' ? null : Number(value);
  const valid = num !== null && isPossibleVisit(num);

  const press = (k: string) => setValue((v) => (v + k).replace(/^0+(?=\d)/, '').slice(0, 3));
  const submit = (t: number) => {
    onTotal(t);
    setValue('');
  };

  return (
    <div className="pad">
      <div className={`total-display ${num !== null && !valid ? 'invalid' : ''}`}>
        {value || <span className="placeholder">Enter score</span>}
      </div>
      <div className="quick">
        {QUICK.map((q) => (
          <button key={q} onClick={() => submit(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="numpad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button key={k} onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <button className="undo" onClick={() => (value ? setValue(value.slice(0, -1)) : onUndo())} disabled={!value && !canUndo}>
          {value ? 'Del' : 'Undo'}
        </button>
        <button onClick={() => press('0')}>0</button>
        <button className="enter" disabled={!valid} onClick={() => num !== null && submit(num)}>
          Enter
        </button>
      </div>
    </div>
  );
}
