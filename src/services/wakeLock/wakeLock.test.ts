import { createScreenWakeLock } from './wakeLock'

function fakeNavigator() {
  const sentinels: { released: boolean; listeners: (() => void)[] }[] = []
  const nav = {
    wakeLock: {
      request: vi.fn(() => {
        const s = { released: false, listeners: [] as (() => void)[] }
        sentinels.push(s)
        return Promise.resolve({
          addEventListener: (_: string, cb: () => void) => s.listeners.push(cb),
          release: () => {
            s.released = true
            s.listeners.forEach((cb) => {
              cb()
            })
            return Promise.resolve()
          },
        })
      }),
    },
  } as unknown as Navigator
  return { nav, sentinels }
}

describe('createScreenWakeLock', () => {
  it('requests and releases the screen lock', async () => {
    const { nav, sentinels } = fakeNavigator()
    const lock = createScreenWakeLock(document, nav)
    await lock.enable()
    expect(nav.wakeLock.request).toHaveBeenCalledWith('screen')
    await lock.disable()
    expect(sentinels[0]?.released).toBe(true)
  })

  it('re-acquires the lock when the page becomes visible again', async () => {
    const { nav, sentinels } = fakeNavigator()
    const lock = createScreenWakeLock(document, nav)
    await lock.enable()
    // The browser releases the lock when the page is hidden.
    sentinels[0]?.listeners.forEach((cb) => {
      cb()
    })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.waitFor(() => {
      expect(nav.wakeLock.request).toHaveBeenCalledTimes(2)
    })
    await lock.disable()
  })

  it('is a no-op when unsupported', async () => {
    const lock = createScreenWakeLock(document, {} as Navigator)
    expect(lock.supported).toBe(false)
    await expect(lock.enable()).resolves.toBeUndefined()
  })
})
