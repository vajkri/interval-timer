import { isTimerConfig, normalizeConfig, type TimerConfig } from '@/domain/timer'

export interface Preset {
  readonly id: string
  readonly name: string
  readonly config: TimerConfig
  /** Epoch ms; used for sorting. */
  readonly updatedAt: number
}

export const PRESET_NAME_MAX_LENGTH = 40

export function sanitizePresetName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, PRESET_NAME_MAX_LENGTH)
}

export function createPreset(
  name: string,
  config: TimerConfig,
  deps: { id: () => string; now: () => number },
): Preset {
  return {
    id: deps.id(),
    name: sanitizePresetName(name) || 'Untitled',
    config: normalizeConfig(config),
    updatedAt: deps.now(),
  }
}

export function isPreset(value: unknown): value is Preset {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.updatedAt === 'number' &&
    isTimerConfig(record.config)
  )
}

/** Most recently updated first. */
export function sortPresets(presets: readonly Preset[]): Preset[] {
  return [...presets].sort((a, b) => b.updatedAt - a.updatedAt)
}

/** Ready-made presets offered on first launch. */
export const BUILT_IN_PRESETS: readonly Omit<Preset, 'id' | 'updatedAt'>[] = [
  {
    name: 'Tabata',
    config: { prepareSec: 10, workSec: 20, restSec: 10, exercises: 8, rounds: 1, roundResetSec: 0 },
  },
  {
    name: 'EMOM 10',
    config: { prepareSec: 10, workSec: 60, restSec: 0, exercises: 10, rounds: 1, roundResetSec: 0 },
  },
  {
    name: 'HIIT 40/20',
    config: {
      prepareSec: 10,
      workSec: 40,
      restSec: 20,
      exercises: 6,
      rounds: 3,
      roundResetSec: 60,
    },
  },
]
