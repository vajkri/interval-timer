import { createContext, use, type ReactNode } from 'react'
import { createWebAudioBeeper, type Beeper } from '@/services/audio'
import { createRepositories, type Repositories } from '@/services/storage'
import { createScreenWakeLock, type ScreenWakeLock } from '@/services/wakeLock'

/** Browser-facing dependencies, injected so features can be tested in isolation. */
export interface AppServices {
  readonly repositories: Repositories
  readonly beeper: Beeper
  readonly wakeLock: ScreenWakeLock
  /** Monotonic clock in ms. */
  readonly now: () => number
  readonly newId: () => string
}

export function createBrowserServices(): AppServices {
  return {
    repositories: createRepositories(),
    beeper: createWebAudioBeeper(),
    wakeLock: createScreenWakeLock(),
    now: () => performance.now(),
    newId: () => crypto.randomUUID(),
  }
}

const ServicesContext = createContext<AppServices | null>(null)

export function ServicesProvider({
  services,
  children,
}: {
  services: AppServices
  children: ReactNode
}) {
  return <ServicesContext value={services}>{children}</ServicesContext>
}

export function useServices(): AppServices {
  const services = use(ServicesContext)
  if (!services) throw new Error('useServices must be used inside <ServicesProvider>')
  return services
}
