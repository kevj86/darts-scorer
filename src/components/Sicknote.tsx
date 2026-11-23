import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const RAINBOW = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#24408e', '#732982', '#ffafc8', '#74d7ee', '#ffffff'];

/** Is this the player who gets the special celebration? */
export const isSicknote = (name: string) => name.trim().toLowerCase() === 'scott';

/** Rainbow confetti bursting across the screen for a few seconds. */
export function useRainbowConfetti(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const fire = (x: number, angle: number) =>
      confetti({ particleCount: 90, spread: 75, startVelocity: 55, angle, origin: { x, y: 0.75 }, colors: RAINBOW, zIndex: 50 });
    const bursts = [
      () => confetti({ particleCount: 180, spread: 120, startVelocity: 45, origin: { x: 0.5, y: 0.45 }, colors: RAINBOW, zIndex: 50 }),
      () => fire(0, 60),
      () => fire(1, 120),
      () => fire(0, 60),
      () => fire(1, 120),
      () => confetti({ particleCount: 150, spread: 160, startVelocity: 35, origin: { x: 0.5, y: 0.2 }, colors: RAINBOW, zIndex: 50, shapes: ['circle', 'square'] }),
    ];
    const timers = bursts.map((b, i) => setTimeout(b, i * 450));
    return () => {
      timers.forEach(clearTimeout);
      confetti.reset();
    };
  }, [active]);
}

const UNICORNS = [
  { left: '6%', top: '8%', size: 2.4, delay: 0 },
  { left: '78%', top: '5%', size: 2.8, delay: 0.6 },
  { left: '91%', top: '38%', size: 1.5, delay: 1.2 },
  { left: '0%', top: '58%', size: 1.5, delay: 0.3 },
  { left: '10%', top: '86%', size: 2.2, delay: 0.9 },
  { left: '80%', top: '84%', size: 2.6, delay: 1.5 },
  { left: '45%', top: '1%', size: 1.8, delay: 1.8 },
  { left: '48%', top: '92%', size: 1.8, delay: 0.4 },
];

/** Pride rainbow stripes with bouncing unicorns, sitting behind the winner message. */
export function UnicornBackdrop() {
  return (
    <div className="sicknote-bg" aria-hidden="true">
      {UNICORNS.map((u, i) => (
        <span key={i} className="unicorn" style={{ left: u.left, top: u.top, fontSize: `${u.size}rem`, animationDelay: `${u.delay}s` }}>
          🦄
        </span>
      ))}
    </div>
  );
}
