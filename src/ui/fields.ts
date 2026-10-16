import type { PhaseKind, TimerField } from '@/domain/timer'

/** Display metadata for each editable timer field. */
export interface FieldMeta {
  readonly label: string
  /** Colour theme; matches the phase colour where the field is a phase. */
  readonly tone: Tone
}

export type Tone = PhaseKind | 'exercises' | 'rounds'

export const FIELD_ORDER: readonly TimerField[] = [
  'prepareSec',
  'workSec',
  'restSec',
  'exercises',
  'rounds',
  'roundResetSec',
]

export const FIELD_META: Readonly<Record<TimerField, FieldMeta>> = {
  prepareSec: { label: 'Get ready', tone: 'prepare' },
  workSec: { label: 'Work', tone: 'work' },
  restSec: { label: 'Rest', tone: 'rest' },
  exercises: { label: 'Exercises', tone: 'exercises' },
  rounds: { label: 'Rounds', tone: 'rounds' },
  roundResetSec: { label: 'Round reset', tone: 'roundReset' },
}

export const PHASE_LABEL: Readonly<Record<PhaseKind, string>> = {
  prepare: 'Get ready',
  work: 'Work',
  rest: 'Rest',
  roundReset: 'Round reset',
}
