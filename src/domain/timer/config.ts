/** User-editable settings that fully describe an interval workout. */
export interface TimerConfig {
  /** Countdown before the first work interval, in seconds. */
  readonly prepareSec: number
  /** Length of each work interval, in seconds. */
  readonly workSec: number
  /** Rest between exercises within a round, in seconds. */
  readonly restSec: number
  /** Number of work intervals per round. */
  readonly exercises: number
  /** Number of times the full set of exercises is repeated. */
  readonly rounds: number
  /** Rest between rounds, in seconds. */
  readonly roundResetSec: number
}

export type TimerField = keyof TimerConfig

export interface FieldLimits {
  readonly min: number
  readonly max: number
  readonly step: number
}

export const FIELD_LIMITS: Readonly<Record<TimerField, FieldLimits>> = {
  prepareSec: { min: 0, max: 60, step: 1 },
  workSec: { min: 1, max: 60 * 60, step: 1 },
  restSec: { min: 0, max: 60 * 60, step: 1 },
  exercises: { min: 1, max: 100, step: 1 },
  rounds: { min: 1, max: 100, step: 1 },
  roundResetSec: { min: 0, max: 60 * 60, step: 1 },
}

export const DEFAULT_CONFIG: TimerConfig = {
  prepareSec: 10,
  workSec: 20,
  restSec: 10,
  exercises: 5,
  rounds: 2,
  roundResetSec: 10,
}

export function clampField(field: TimerField, value: number): number {
  const { min, max } = FIELD_LIMITS[field]
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

/** Returns a copy of `config` with every field clamped to its valid range. */
export function normalizeConfig(config: TimerConfig): TimerConfig {
  return {
    prepareSec: clampField('prepareSec', config.prepareSec),
    workSec: clampField('workSec', config.workSec),
    restSec: clampField('restSec', config.restSec),
    exercises: clampField('exercises', config.exercises),
    rounds: clampField('rounds', config.rounds),
    roundResetSec: clampField('roundResetSec', config.roundResetSec),
  }
}

/** Type guard for untrusted input (e.g. parsed from storage). */
export function isTimerConfig(value: unknown): value is TimerConfig {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (Object.keys(FIELD_LIMITS) as TimerField[]).every(
    (field) => typeof record[field] === 'number' && Number.isFinite(record[field]),
  )
}
