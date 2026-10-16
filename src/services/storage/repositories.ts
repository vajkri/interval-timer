import { isPreset, type Preset } from '@/domain/presets'
import { DEFAULT_CONFIG, isTimerConfig, normalizeConfig, type TimerConfig } from '@/domain/timer'
import { browserStore, createSlot, type KeyValueStore } from './storage'

export interface Settings {
  readonly muted: boolean
  /**
   * Play cues even when the iPhone is in silent mode. On iOS this pauses music
   * from other apps, so it is off by default.
   */
  readonly playInSilentMode: boolean
}

export const DEFAULT_SETTINGS: Settings = { muted: false, playInSilentMode: false }

/** Accepts settings saved by older versions, which lack newer fields. */
const isStoredSettings = (value: unknown): value is Partial<Settings> => {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.muted === 'boolean' &&
    (record.playInSilentMode === undefined || typeof record.playInSilentMode === 'boolean')
  )
}

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
  const settings = createSlot<Partial<Settings>>(store, {
    key: 'settings',
    version: 1,
    fallback: DEFAULT_SETTINGS,
    validate: isStoredSettings,
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
    settings: {
      read: (): Settings => ({ ...DEFAULT_SETTINGS, ...settings.read() }),
      write: (value: Settings) => {
        settings.write(value)
      },
    },
  }
}

export type Repositories = ReturnType<typeof createRepositories>
