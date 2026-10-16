import { useCallback, useState } from 'react'
import { useServices } from '@/app/services'

export function useMuted(): [boolean, () => void] {
  const { repositories } = useServices()
  const [muted, setMuted] = useState(() => repositories.settings.read().muted)
  const toggle = useCallback(() => {
    setMuted((current) => {
      const next = !current
      repositories.settings.write({ ...repositories.settings.read(), muted: next })
      return next
    })
  }, [repositories])
  return [muted, toggle]
}
