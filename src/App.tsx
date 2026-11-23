import { useEffect, useState } from 'react';
import { Game } from './components/Game';
import { Setup } from './components/Setup';
import { type Game as GameState, type InputMode, newGame } from './logic/game';
import { load, save } from './storage';

interface Session {
  game: GameState;
  history: GameState[];
  mode: InputMode;
}

const SESSION_KEY = 'darts-scorer:session';
const MAX_HISTORY = 300;

export default function App() {
  const [session, setSession] = useState<Session | null>(() => load<Session | null>(SESSION_KEY, null));

  useEffect(() => save(SESSION_KEY, session), [session]);

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
    return <Setup onStart={({ names, startScore, mode }) => setSession({ game: newGame(names, startScore), history: [], mode })} />;
  }

  const { game, history, mode } = session;

  return (
    <Game
      game={game}
      mode={mode}
      canUndo={history.length > 0}
      onChange={(g) => setSession({ ...session, game: g, history: [...history, game].slice(-MAX_HISTORY) })}
      onUndo={() => history.length && setSession({ ...session, game: history.at(-1)!, history: history.slice(0, -1) })}
      onMode={(m) => setSession({ ...session, mode: m })}
      onQuit={() => setSession(null)}
      onRematch={() =>
        setSession({
          ...session,
          history: [],
          game: newGame(
            game.players.map((p) => p.name),
            game.startScore,
            game.firstPlayer + 1,
          ),
        })
      }
    />
  );
}
