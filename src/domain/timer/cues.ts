import type { PhaseKind, Schedule } from './schedule'

/** Audible events the runner should play. */
export type Cue = 'countdown' | 'work' | 'rest' | 'done'

/** Number of seconds before a phase change that get a countdown beep. */
export const COUNTDOWN_SECONDS = 3

const CUE_FOR_PHASE: Readonly<Record<PhaseKind, Cue | null>> = {
  prepare: null,
  work: 'work',
  rest: 'rest',
  roundReset: 'rest',
}

/**
 * Returns the cues whose trigger time falls in the half-open interval
 * `(fromMs, toMs]`. Called once per tick with the previous and current elapsed
 * time, so every cue fires exactly once regardless of tick rate or jank.
 * Pass a negative `fromMs` on the first tick so cues at t=0 are included.
 */
export function cuesBetween(schedule: Schedule, fromMs: number, toMs: number): Cue[] {
  if (toMs <= fromMs) return []
  const crossed = (at: number) => at > fromMs && at <= toMs
  const cues: Cue[] = []

  for (const segment of schedule.segments) {
    const endMs = segment.startMs + segment.durationMs
    if (endMs <= fromMs) continue
    if (segment.startMs > toMs) break

    const phaseCue = CUE_FOR_PHASE[segment.kind]
    if (phaseCue && crossed(segment.startMs)) cues.push(phaseCue)

    for (let s = COUNTDOWN_SECONDS; s >= 1; s--) {
      const at = endMs - s * 1000
      if (at > segment.startMs && crossed(at)) cues.push('countdown')
    }
  }

  if (crossed(schedule.totalMs)) cues.push('done')
  return cues
}
