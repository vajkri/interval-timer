import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ServicesProvider, type AppServices } from '@/app/services'
import type { Cue } from '@/domain/timer'
import { createRepositories, type KeyValueStore } from '@/services/storage'

export function memoryStore(): KeyValueStore {
  const data = new Map<string, string>()
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
  }
}

/** Services with an in-memory store, a manual clock and a recording beeper. */
export function createFakeServices() {
  const clock = { now: 0 }
  const played: Cue[] = []
  let id = 0
  const services: AppServices = {
    repositories: createRepositories(memoryStore()),
    beeper: {
      unlock: () => Promise.resolve(),
      play: (cue) => played.push(cue),
    },
    wakeLock: {
      supported: true,
      enable: vi.fn(() => Promise.resolve()),
      disable: vi.fn(() => Promise.resolve()),
    },
    now: () => clock.now,
    newId: () => `id-${++id}`,
  }
  return { services, clock, played }
}

export function renderWithServices(ui: ReactElement, services = createFakeServices().services) {
  return render(<ServicesProvider services={services}>{ui}</ServicesProvider>)
}
