import { useState } from 'react'
import { CompleteScreen } from '@/features/complete/CompleteScreen'
import { PresetsScreen } from '@/features/presets/PresetsScreen'
import { usePresets } from '@/features/presets/usePresets'
import { RunScreen } from '@/features/run/RunScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { useSettings } from '@/features/settings/useSettings'
import { SetupScreen } from '@/features/setup/SetupScreen'
import { useTimerConfig } from '@/features/setup/useTimerConfig'
import type { TimerConfig } from '@/domain/timer'
import { useServices } from './services'

type Screen =
  | { readonly name: 'setup' }
  | { readonly name: 'presets' }
  | { readonly name: 'settings' }
  | { readonly name: 'run'; readonly config: TimerConfig }
  | { readonly name: 'complete'; readonly config: TimerConfig }

export function App() {
  const { beeper } = useServices()
  const [screen, setScreen] = useState<Screen>({ name: 'setup' })
  const [config, setConfig] = useTimerConfig()
  const presets = usePresets()
  const [settings, updateSettings] = useSettings()

  /** A short taste of a workout: 3-2-1, work, rest, done. */
  const previewSounds = () => {
    void beeper.unlock()
    const preview = [
      ['countdown', 0],
      ['countdown', 0.6],
      ['countdown', 1.2],
      ['work', 1.8],
      ['rest', 4],
      ['done', 6],
    ] as const
    for (const [cue, at] of preview) beeper.play(cue, at)
  }

  const startWorkout = (workout: TimerConfig) => {
    // Must run synchronously inside the tap handler for iOS to allow audio.
    void beeper.unlock()
    setScreen({ name: 'run', config: workout })
  }

  switch (screen.name) {
    case 'setup':
      return (
        <SetupScreen
          config={config}
          onChange={setConfig}
          onStart={() => {
            startWorkout(config)
          }}
          onOpenPresets={() => {
            setScreen({ name: 'presets' })
          }}
          onOpenSettings={() => {
            setScreen({ name: 'settings' })
          }}
        />
      )
    case 'presets':
      return (
        <PresetsScreen
          presets={presets}
          currentConfig={config}
          onBack={() => {
            setScreen({ name: 'setup' })
          }}
          onSelect={(preset) => {
            setConfig(preset.config)
            setScreen({ name: 'setup' })
          }}
        />
      )
    case 'settings':
      return (
        <SettingsScreen
          settings={settings}
          onChange={(patch) => {
            updateSettings(patch)
            if (patch.soundSet) {
              // Preview a newly picked set straight away, inside the tap.
              beeper.setSoundSet(patch.soundSet)
              previewSounds()
            }
          }}
          onTestSound={previewSounds}
          onBack={() => {
            setScreen({ name: 'setup' })
          }}
        />
      )
    case 'run':
      return (
        <RunScreen
          config={screen.config}
          muted={settings.muted}
          onToggleMuted={() => {
            updateSettings({ muted: !settings.muted })
          }}
          onExit={() => {
            setScreen({ name: 'setup' })
          }}
          onFinish={() => {
            setScreen({ name: 'complete', config: screen.config })
          }}
        />
      )
    case 'complete':
      return (
        <CompleteScreen
          config={screen.config}
          isSavedPreset={presets.containsConfig(screen.config)}
          onSavePreset={(name) => {
            presets.save(name, screen.config)
          }}
          onRepeat={() => {
            startWorkout(screen.config)
          }}
          onDone={() => {
            setScreen({ name: 'setup' })
          }}
        />
      )
  }
}
