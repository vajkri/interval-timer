import { FIELD_LIMITS, type TimerField } from './config'

const DURATION_BANDS: readonly { upTo: number; step: number }[] = [
  { upTo: 60, step: 1 },
  { upTo: 5 * 60, step: 5 },
  { upTo: 30 * 60, step: 15 },
  { upTo: Infinity, step: 60 },
]

const DURATION_FIELDS: ReadonlySet<TimerField> = new Set([
  'prepareSec',
  'workSec',
  'restSec',
  'roundResetSec',
])

export function isDurationField(field: TimerField): boolean {
  return DURATION_FIELDS.has(field)
}

/**
 * The values a picker offers for a field. Durations get coarser steps as they
 * grow (1s up to a minute, then 5s, 15s, 1min) so one drag covers the range.
 */
export function valueSteps(field: TimerField): number[] {
  const { min, max } = FIELD_LIMITS[field]
  const values: number[] = []
  let v = min
  while (v <= max) {
    values.push(v)
    const step = isDurationField(field) ? (DURATION_BANDS.find((b) => v < b.upTo)?.step ?? 60) : 1
    v += step
  }
  return values
}

/** Index of the step closest to `value`. */
export function nearestStepIndex(steps: readonly number[], value: number): number {
  let best = 0
  steps.forEach((step, i) => {
    if (Math.abs(step - value) < Math.abs((steps[best] ?? 0) - value)) best = i
  })
  return best
}
