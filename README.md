# Interval Timer

A simple, installable interval timer for workouts, built as a Progressive Web App.
It's inspired by the _Interval Timer – Workout Timer_ iOS app: set work, rest,
exercises, rounds and round reset, press play, and follow the colours and beeps.

**Live app:** https://vajkri.github.io/interval-timer/

## Features

- **Setup screen** showing the total workout time. Tap any row to open a full-screen picker:
  drag up or down, tap −/+, or use the arrow keys.
- **Run screen you can read from across the room.** The whole screen changes colour per
  phase. Work is bright green with dark text and rest is deep red with white text, so the
  two also differ in brightness, not just hue (which helps with red/green colour blindness).
  Get ready is indigo and round reset is amber.
- **Beeps:** a different sound for the 3-2-1 countdown, work start, rest start and the end
  of the workout. Sounds are synthesized with Web Audio and mix with your music instead of
  pausing it.
- **The screen stays on** while a workout runs (Screen Wake Lock API).
- **Pause, skip and end:** End only appears while paused, so you can't stop a workout by
  accident.
- **Two sound sets** you choose between in Settings: **Bells** (soft bells and chimes, the
  default) and **Beeps** (sharp electronic beeps that are easier to hear over music).
- **Presets:** save, load and delete timer setups. Tabata, EMOM 10 and HIIT 40/20 are included.
- **Completion screen** with a summary, Repeat, and Save as preset.
- **Works offline** once installed. Everything is stored on the device; there's no backend,
  no tracking and no network calls.

## Install on iPhone

1. Open https://vajkri.github.io/interval-timer/ in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open the app from your home screen.

Notes for iOS:

- Keeping the screen on needs iOS 16.4+ in Safari, or iOS 18.4+ for the home-screen app.
- **Silent mode vs. music:** by default the beeps mix with your music (Spotify keeps
  playing), but iOS mutes them in silent mode. In **Settings → Play sounds in silent mode**
  you can make them play through silent mode, but then iOS pauses other apps' music when a
  sound plays. WebKit gives web apps no option that does both (see
  `src/services/audio/beeper.ts`). Use **Test sound** in Settings to check.
- Web apps can't play sound while the phone is locked or another app is in front. The timer
  keeps the correct time, but cues are skipped until you come back. The screen stays on while
  the app is open, so normally this doesn't come up.

## Development

Requirements: Node 24 (see `.nvmrc`) and pnpm (see `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev          # dev server at http://localhost:5173/interval-timer/
pnpm check        # format check, lint, typecheck, tests
pnpm build        # production build in dist/
pnpm preview      # serve the production build
```

### Sound lab

Try out the cue sounds at `pnpm sound-lab`, or on your phone at
https://vajkri.github.io/interval-timer/tools/sound-lab/. Each cue has several options,
each one is labelled with the sound set that uses it, and **Play sequence** plays your picks in
workout order. All sounds live in `src/services/audio/sounds.ts`. To change what the app
plays, edit `SOUND_SETS` in `src/services/audio/soundSets.ts`.

To test on your phone during development, run `pnpm dev --host` and open the network URL.
Wake Lock and installing need HTTPS, so use the deployed site to test those.

## Deployment

Every push to `main` runs CI (format, lint, typecheck, tests, build). When CI passes, the
site is deployed to GitHub Pages by `.github/workflows/ci.yml`.

## Project docs

- [Architecture](docs/ARCHITECTURE.md): layers, data flow and design decisions
- [Security](SECURITY.md): security model and how to report issues
