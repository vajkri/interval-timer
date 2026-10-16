import { useCallback, useMemo, useState } from 'react'
import { useServices } from '@/app/services'
import { BUILT_IN_PRESETS, createPreset, sortPresets, type Preset } from '@/domain/presets'
import type { TimerConfig, TimerField } from '@/domain/timer'

export interface PresetsApi {
  readonly list: readonly Preset[]
  readonly save: (name: string, config: TimerConfig) => void
  readonly remove: (id: string) => void
  readonly containsConfig: (config: TimerConfig) => boolean
}

const sameConfig = (a: TimerConfig, b: TimerConfig) =>
  (Object.keys(a) as TimerField[]).every((key) => a[key] === b[key])

export function usePresets(): PresetsApi {
  const { repositories, newId } = useServices()
  const [list, setList] = useState<Preset[]>(() => {
    const stored = repositories.presets.read()
    if (stored) return sortPresets(stored)
    // First launch: seed a few useful presets.
    const seeded = BUILT_IN_PRESETS.map((p, i) =>
      createPreset(p.name, p.config, { id: newId, now: () => BUILT_IN_PRESETS.length - i }),
    )
    repositories.presets.write(seeded)
    return seeded
  })

  const commit = useCallback(
    (update: (current: Preset[]) => Preset[]) => {
      setList((current) => {
        const next = sortPresets(update(current))
        repositories.presets.write(next)
        return next
      })
    },
    [repositories],
  )

  const save = useCallback(
    (name: string, config: TimerConfig) => {
      commit((current) => [...current, createPreset(name, config, { id: newId, now: Date.now })])
    },
    [commit, newId],
  )

  const remove = useCallback(
    (id: string) => {
      commit((current) => current.filter((p) => p.id !== id))
    },
    [commit],
  )

  return useMemo(
    () => ({
      list,
      save,
      remove,
      containsConfig: (config: TimerConfig) => list.some((p) => sameConfig(p.config, config)),
    }),
    [list, save, remove],
  )
}
