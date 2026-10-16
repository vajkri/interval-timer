# Interval Timer: notes for Claude

- Read `docs/ARCHITECTURE.md` before changing structure. Keep the layering:
  `domain/` is pure TS (no React, no browser APIs), `services/` wraps browser APIs,
  and `features/` holds screens. ESLint enforces this.
- Timing logic belongs in `src/domain/timer` and must be unit tested. Never count time
  by ticks; derive it from the clock.
- Run `pnpm check` before committing. CI runs the same checks plus `pnpm build`.
- Dependencies: pnpm with `minimumReleaseAge: 4320` (3 days). Don't remove it. Pin
  GitHub Actions to commit SHAs from releases at least 3 days old.
- The production CSP disallows inline scripts and styles in HTML. Set dynamic styles
  through React `style` props (CSSOM), never through `<style>` tags or `style=""` strings.
