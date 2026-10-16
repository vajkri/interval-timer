import { normalizeConfig, type TimerConfig } from './config'

export type PhaseKind = 'prepare' | 'work' | 'rest' | 'roundReset'

/** One contiguous block of time in a workout. */
export interface Segment {
  readonly kind: PhaseKind
  /** Offset from the start of the workout, in ms. */
  readonly startMs: number
  readonly durationMs: number
  /** Zero-based index of the exercise this segment belongs to. */
  readonly exerciseIndex: number
  /** Zero-based index of the round this segment belongs to. */
  readonly roundIndex: number
}

export interface Schedule {
  readonly config: TimerConfig
  readonly segments: readonly Segment[]
  /** Total length including the prepare countdown, in ms. */
  readonly totalMs: number
  /** Length of the workout itself (excluding prepare), in ms. */
  readonly workoutMs: number
}

/**
 * Expands a config into an ordered list of segments.
 *
 * Shape: prepare → [work, rest, work, rest, …, work] per round, with a
 * round reset between rounds. There is no rest after the last exercise of a
 * round and nothing after the final work interval.
 */
export function buildSchedule(input: TimerConfig): Schedule {
  const config = normalizeConfig(input)
  const segments: Segment[] = []
  let cursor = 0

  const push = (kind: PhaseKind, seconds: number, exerciseIndex: number, roundIndex: number) => {
    if (seconds <= 0) return
    const durationMs = seconds * 1000
    segments.push({ kind, startMs: cursor, durationMs, exerciseIndex, roundIndex })
    cursor += durationMs
  }

  push('prepare', config.prepareSec, 0, 0)
  const prepareMs = cursor

  for (let round = 0; round < config.rounds; round++) {
    for (let exercise = 0; exercise < config.exercises; exercise++) {
      push('work', config.workSec, exercise, round)
      const lastExercise = exercise === config.exercises - 1
      if (!lastExercise) push('rest', config.restSec, exercise, round)
    }
    const lastRound = round === config.rounds - 1
    if (!lastRound) push('roundReset', config.roundResetSec, config.exercises - 1, round)
  }

  return { config, segments, totalMs: cursor, workoutMs: cursor - prepareMs }
}

/** Duration of the workout (excluding prepare) in whole seconds. */
export function workoutSeconds(config: TimerConfig): number {
  return Math.round(buildSchedule(config).workoutMs / 1000)
}
