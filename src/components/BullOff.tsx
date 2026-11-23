import { Logo } from './Setup';

interface Props {
  names: string[];
  onPick: (index: number) => void;
  onCancel: () => void;
}

/** Players throw for the bull; whoever is closest throws first. */
export function BullOff({ names, onPick, onCancel }: Props) {
  return (
    <div className="modal-bg bull-off">
      <div className="modal">
        <Logo />
        <h2>Closest to the bull</h2>
        <p className="muted">Everyone throw one dart at the bull. Tap the closest player to throw first.</p>
        <div className="bull-players">
          {names.map((name, i) => (
            <button key={i} className="bull-player" onClick={() => onPick(i)}>
              {name}
            </button>
          ))}
        </div>
        <button className="ghost wide" onClick={onCancel}>
          Back
        </button>
      </div>
    </div>
  );
}
