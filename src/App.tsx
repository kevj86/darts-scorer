import { useEffect, useState } from 'react';
import { BullOff } from './components/BullOff';
import { Game } from './components/Game';
import { Setup } from './components/Setup';
import { type Game as GameState, type GameType, type InputMode, newGame } from './logic/game';
import { load, save } from './storage';

interface Session {
  game: GameState;
  history: GameState[];
  mode: InputMode;
}

interface PendingStart {
  names: string[];
  startScore: GameType;
  mode: InputMode;
}

const SESSION_KEY = 'darts-scorer:session';
const MAX_HISTORY = 300;

export default function App() {
  const [session, setSession] = useState<Session | null>(() => load<Session | null>(SESSION_KEY, null));

  const [bullOff, setBullOff] = useState<PendingStart | null>(null);

  useEffect(() => save(SESSION_KEY, session), [session]);

  const begin = (p: PendingStart, first: number) => {
    setSession({ game: newGame(p.names, p.startScore, first), history: [], mode: p.mode });
    setBullOff(null);
  };

  // Ask who was closest to the bull, unless it's a solo game.
  const requestStart = (p: PendingStart) => (p.names.length > 1 ? setBullOff(p) : begin(p, 0));

  const bullOffModal = bullOff && (
    <BullOff names={bullOff.names} onPick={(i) => begin(bullOff, i)} onCancel={() => setBullOff(null)} />
  );

  // Keep the screen awake while a game is on.
  useEffect(() => {
    if (!session) return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    const request = () => {
      if (document.visibilityState === 'visible') nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      lock?.release().catch(() => {});
    };
  }, [session !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) {
    return (
      <>
        <Setup onStart={requestStart} />
        {bullOffModal}
      </>
    );
  }

  const { game, history, mode } = session;

  return (
    <>
      <Game
        game={game}
        mode={mode}
        canUndo={history.length > 0}
        onChange={(g) => setSession({ ...session, game: g, history: [...history, game].slice(-MAX_HISTORY) })}
        onUndo={() => history.length && setSession({ ...session, game: history.at(-1)!, history: history.slice(0, -1) })}
        onMode={(m) => setSession({ ...session, mode: m })}
        onQuit={() => setSession(null)}
        onRematch={() => requestStart({ names: game.players.map((p) => p.name), startScore: game.startScore, mode })}
      />
      {bullOffModal}
    </>
  );
}
