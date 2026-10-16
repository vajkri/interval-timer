import { useCallback, useEffect, useState } from 'react'
import { useServices } from '@/app/services'
import type { Settings } from '@/services/storage'

/** App-wide settings, persisted, with the audio mode kept in sync. */
export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const { repositories, beeper } = useServices()
  const [settings, setSettings] = useState(() => repositories.settings.read())

  useEffect(() => {
    beeper.setPlayInSilentMode(settings.playInSilentMode)
  }, [beeper, settings.playInSilentMode])

  useEffect(() => {
    beeper.setSoundSet(settings.soundSet)
  }, [beeper, settings.soundSet])

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch }
        repositories.settings.write(next)
        return next
      })
    },
    [repositories],
  )

  return [settings, update]
}
