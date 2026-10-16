import { cuesBetween, type Cue } from './cues'
import { positionAt, type Position } from './position'
import type { Schedule } from './schedule'

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished'

/**
 * Immutable snapshot of a workout in progress. Time is never counted by
 * ticks; elapsed time is derived from a monotonic clock, so the timer stays
 * accurate even if the browser throttles or pauses JavaScript.
 */
export interface RunState {
  readonly status: RunStatus
  /** Clock reading when the current running stretch began. */
  readonly resumedAt: number
  /** Elapsed time banked before the current running stretch. */
  readonly bankedMs: number
  /** Elapsed time at the last tick; cues fire for time passed since then. */
  readonly lastTickMs: number
}

/**
 * If more than this much time passed between ticks (e.g. the phone was
 * locked), the backlog of cues is dropped rather than played in a burst.
 */
export const MAX_CUE_GAP_MS = 1500

export const initialRunState: RunState = {
  status: 'idle',
  resumedAt: 0,
  bankedMs: 0,
  lastTickMs: -1,
}

export function elapsedMs(state: RunState, now: number): number {
  return state.status === 'running' ? state.bankedMs + (now - state.resumedAt) : state.bankedMs
}

export function start(now: number): RunState {
  return { status: 'running', resumedAt: now, bankedMs: 0, lastTickMs: -1 }
}

export function pause(state: RunState, now: number): RunState {
  if (state.status !== 'running') return state
  return { ...state, status: 'paused', bankedMs: elapsedMs(state, now) }
}

export function resume(state: RunState, now: number): RunState {
  if (state.status !== 'paused') return state
  return { ...state, status: 'running', resumedAt: now }
}

/** Jumps to the start of the next segment (or the end of the workout). */
export function skip(state: RunState, schedule: Schedule, now: number): RunState {
  if (state.status !== 'running' && state.status !== 'paused') return state
  const pos = positionAt(schedule, elapsedMs(state, now))
  if (pos.status === 'finished') return state
  const target = pos.segment.startMs + pos.segment.durationMs
  // Moving lastTickMs too means no cues fire for the skipped stretch; the
  // next tick announces the new phase.
  return { ...state, bankedMs: target, resumedAt: now, lastTickMs: target - 1 }
}

export interface TickResult {
  readonly state: RunState
  readonly position: Position
  readonly cues: readonly Cue[]
}

/** Advances the runner to `now` and reports cues to play. */
export function tick(state: RunState, schedule: Schedule, now: number): TickResult {
  const elapsed = Math.min(elapsedMs(state, now), schedule.totalMs)
  const position = positionAt(schedule, elapsed)
  if (state.status !== 'running') return { state, position, cues: [] }

  const gap = elapsed - state.lastTickMs
  const cues = gap > MAX_CUE_GAP_MS ? [] : cuesBetween(schedule, state.lastTickMs, elapsed)
  const finished = position.status === 'finished'
  const next: RunState = finished
    ? { ...state, status: 'finished', bankedMs: schedule.totalMs, lastTickMs: elapsed }
    : { ...state, lastTickMs: elapsed }
  return {
    state: next,
    position,
    cues: finished && !cues.includes('done') ? [...cues, 'done'] : cues,
  }
}
