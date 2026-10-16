import { isPreset, type Preset } from '@/domain/presets'
import { DEFAULT_CONFIG, isTimerConfig, normalizeConfig, type TimerConfig } from '@/domain/timer'
import { browserStore, createSlot, type KeyValueStore } from './storage'

export interface Settings {
  readonly muted: boolean
}

const isSettings = (value: unknown): value is Settings =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).muted === 'boolean'

const isPresetList = (value: unknown): value is Preset[] =>
  Array.isArray(value) && value.every(isPreset)

/** All persisted app state, behind one seam so it can be swapped in tests. */
export function createRepositories(store: KeyValueStore | undefined = browserStore()) {
  const lastConfig = createSlot<TimerConfig>(store, {
    key: 'last-config',
    version: 1,
    fallback: DEFAULT_CONFIG,
    validate: isTimerConfig,
  })
  return {
    lastConfig: {
      read: () => normalizeConfig(lastConfig.read()),
      write: (config: TimerConfig) => {
        lastConfig.write(config)
      },
    },
    presets: createSlot<Preset[] | null>(store, {
      key: 'presets',
      version: 1,
      // null = never initialised, so built-in presets can be seeded once.
      fallback: null,
      validate: (v): v is Preset[] | null => v === null || isPresetList(v),
    }),
    settings: createSlot<Settings>(store, {
      key: 'settings',
      version: 1,
      fallback: { muted: false },
      validate: isSettings,
    }),
  }
}

export type Repositories = ReturnType<typeof createRepositories>
