import type { Schedule, Segment } from './schedule'

/** Where a workout is at a given elapsed time. */
export type Position =
  | {
      readonly status: 'running'
      readonly segmentIndex: number
      readonly segment: Segment
      /** Time left in the current segment, in ms. */
      readonly segmentRemainingMs: number
      /** 0 → 1 progress through the current segment. */
      readonly segmentProgress: number
      /** Time left in the whole workout, in ms. */
      readonly totalRemainingMs: number
    }
  | { readonly status: 'finished' }

/** Locates `elapsedMs` within the schedule using binary search. */
export function positionAt(schedule: Schedule, elapsedMs: number): Position {
  const { segments, totalMs } = schedule
  if (segments.length === 0 || elapsedMs >= totalMs) return { status: 'finished' }

  const t = Math.max(0, elapsedMs)
  let lo = 0
  let hi = segments.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if ((segments[mid]?.startMs ?? Infinity) <= t) lo = mid
    else hi = mid - 1
  }

  const segment = segments[lo]
  if (!segment) return { status: 'finished' }
  const into = t - segment.startMs
  return {
    status: 'running',
    segmentIndex: lo,
    segment,
    segmentRemainingMs: segment.durationMs - into,
    segmentProgress: into / segment.durationMs,
    totalRemainingMs: totalMs - t,
  }
}
