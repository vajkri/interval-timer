/**
 * Keeps the screen on while a workout runs (Screen Wake Lock API, supported
 * in iOS Safari 16.4+ and home-screen apps since iOS 18.4).
 *
 * The browser drops the lock whenever the page is hidden, so it is
 * re-requested automatically when the page becomes visible again.
 */
export interface ScreenWakeLock {
  readonly supported: boolean
  enable(): Promise<void>
  disable(): Promise<void>
}

export function createScreenWakeLock(
  doc: Document = document,
  nav: Navigator = navigator,
): ScreenWakeLock {
  const supported = 'wakeLock' in nav
  let wanted = false
  let sentinel: WakeLockSentinel | null = null

  const request = async () => {
    if (!supported || !wanted || sentinel || doc.visibilityState !== 'visible') return
    try {
      sentinel = await nav.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        sentinel = null
      })
    } catch {
      // Denied (e.g. low-power mode). The timer still works; the screen may sleep.
      sentinel = null
    }
  }

  const onVisibilityChange = () => {
    void request()
  }

  return {
    supported,
    async enable() {
      if (wanted) return
      wanted = true
      doc.addEventListener('visibilitychange', onVisibilityChange)
      await request()
    },
    async disable() {
      wanted = false
      doc.removeEventListener('visibilitychange', onVisibilityChange)
      const current = sentinel
      sentinel = null
      await current?.release().catch(() => undefined)
    },
  }
}
