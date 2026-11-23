# Darts Scorer

A mobile-first progressive web app (PWA) for keeping score in darts, themed in black with a choice of neon green or neon blue.

## Features

- 1 to 4 players, each with a name
- 301 or 501, double out, single leg
- **Every dart** entry (single / double / treble, 25, bull, miss): the score updates with each dart
- **Turn total** entry for faster scoring, with quick buttons (26, 41, 45, 60, 81, 85, 100, 140, 180)
- Live **best checkout** suggestion that updates after every dart, based on the darts left in the turn
- **Bust** handling: going below zero, leaving 1, or finishing on a non-double resets to the score at the start of the turn
- Live 3-dart average for each player, plus end-of-game stats (darts, highest score, 100+, 140+, 180s)
- Undo, rematch (the starting player rotates), and the game survives a page refresh
- Neon green or neon blue colour scheme, chosen on the setup screen and remembered
- Installable and works offline; keeps the screen awake during a game

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # game-logic unit tests
npm run build    # production build in dist/
```

Built with React, TypeScript, Vite and vite-plugin-pwa.

## Deploying

Hosted on Netlify. `netlify.toml` holds the settings: build with `npm test && npm run build` and publish `dist/`.
Every push to `main` deploys automatically once the repo is linked in Netlify.

## Installing on your phone

Open the Netlify URL, then:
- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** menu → Install app
