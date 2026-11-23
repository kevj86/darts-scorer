import { load, save } from './storage';

export type Theme = 'green' | 'blue';
const KEY = 'darts-scorer:theme';

export const THEMES: { id: Theme; label: string; color: string; bg: string }[] = [
  { id: 'green', label: 'Neon green', color: '#a6ff00', bg: '#050605' },
  { id: 'blue', label: 'Neon blue', color: '#00d9ff', bg: '#050608' },
];

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES.find((t) => t.id === theme)!.bg);
}

export function loadTheme(): Theme {
  const t = load<Theme>(KEY, 'green');
  return THEMES.some((x) => x.id === t) ? t : 'green';
}

export function saveTheme(theme: Theme): void {
  save(KEY, theme);
  applyTheme(theme);
}
