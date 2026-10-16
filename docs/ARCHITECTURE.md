# Architecture

## Stack

| Concern | Choice                                                      |
| ------- | ----------------------------------------------------------- |
| UI      | React 19, TypeScript (strict), CSS Modules                  |
| Build   | Vite, `vite-plugin-pwa` (Workbox service worker)            |
| Tests   | Vitest, Testing Library, jsdom                              |
| Quality | ESLint (`typescript-eslint` strict, type-checked), Prettier |
| CI/CD   | GitHub Actions → GitHub Pages                               |

No router and no state library. The app has four screens and very little shared state, so
React's own state plus a small screen state machine in `App.tsx` is enough.

## Layers

```
src/
├── domain/        Pure TypeScript. No React, no browser APIs. Fully unit tested.
│   ├── timer/     config, schedule, position lookup, cue detection, runner state machine
│   └── presets/   preset model, validation, built-in presets
├── services/      Thin adapters over browser APIs (no React)
│   ├── audio/     Web Audio beeper + cue sound definitions
│   ├── wakeLock/  Screen Wake Lock with automatic re-acquire
│   └── storage/   Versioned, validated localStorage slots
├── app/           Composition root: App screen state machine + dependency injection
├── features/      One folder per screen: component, styles, hooks
│   ├── setup/  run/  complete/  presets/
├── ui/            Shared presentational pieces (Button, icons, field metadata)
├── styles/        Global CSS, design tokens, phase colours
└── test/          Test setup and fakes
```

Dependencies only point **downwards**: `features → services → domain`. ESLint
(`no-restricted-imports`) enforces that `domain/` imports nothing from React, services or
UI, and that `services/` imports nothing from React or UI.

## Timing model

The most important design decision: **time is never counted by ticks.**

1. `buildSchedule(config)` expands a config into an ordered list of segments
   (`prepare → work → rest → … → roundReset → …`), each with a start offset and a duration.
2. The runner (`domain/timer/runner.ts`) is an immutable state machine that stores only
   _when_ it started or resumed and how much time is already banked. Elapsed time is always
   `banked + (now − resumedAt)`, read from the monotonic `performance.now()` clock.
3. `positionAt(schedule, elapsed)` finds the current segment with a binary search.
4. `cuesBetween(schedule, prevElapsed, elapsed)` returns every cue (countdown, work, rest,
   done) whose trigger time lies in `(prev, now]`. So each cue fires exactly once, however
   often or irregularly the UI ticks.

The `useWorkoutRunner` hook samples the clock every 50 ms, plays any cues and renders. If
the browser throttles JavaScript (e.g. the screen is locked), the timer stays correct when
it resumes. A cue backlog older than 1.5 s is dropped instead of played in a burst.

## Dependency injection

`app/services.tsx` defines `AppServices` (repositories, beeper, wake lock, clock, id
generator), provided through React context. Production uses the real browser adapters.
Tests use `test/fakeServices.tsx`, with an in-memory store, a manual clock and a recording
beeper, so whole workouts can run deterministically in milliseconds.

## Persistence

`services/storage` wraps `localStorage` in typed **slots**. Each one has a namespaced,
versioned key (`interval-timer:presets:v1`) and a validator. Corrupt or unexpected data
falls back to a default instead of crashing. If a stored shape changes, bump the version and
add a migration when reading.

## Audio

Cues are synthesized with oscillators (`services/audio/tones.ts`), so there are no audio
files to load and changing a sound is a one-line edit. The `AudioContext` is unlocked inside
the Start tap (iOS needs a user gesture). It runs under the `ambient` audio session, so it
mixes with music.

## Adding things

- **New timer setting:** add it to `TimerConfig`, `FIELD_LIMITS`, `DEFAULT_CONFIG`,
  `normalizeConfig`, `buildSchedule` and `ui/fields.ts`. Bump the storage version for
  `last-config` and `presets`.
- **New cue sound:** add a `Cue` and its tones in `tones.ts`, then emit it from
  `cuesBetween`.
- **New screen:** add a folder under `features/` and a case to the `Screen` union in
  `App.tsx`.
