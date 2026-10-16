import { useCallback, useState } from 'react'
import { useServices } from '@/app/services'
import { normalizeConfig, type TimerConfig } from '@/domain/timer'

/** The config being edited on the setup screen, persisted between visits. */
export function useTimerConfig(): [TimerConfig, (config: TimerConfig) => void] {
  const { repositories } = useServices()
  const [config, setState] = useState(() => repositories.lastConfig.read())

  const setConfig = useCallback(
    (next: TimerConfig) => {
      const normalized = normalizeConfig(next)
      setState(normalized)
      repositories.lastConfig.write(normalized)
    },
    [repositories],
  )

  return [config, setConfig]
}
