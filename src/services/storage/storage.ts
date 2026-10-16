/**
 * Minimal key/value persistence with versioned keys and validation on read.
 * All data stays on the device; nothing is sent anywhere.
 */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const NAMESPACE = 'interval-timer'

export interface Slot<T> {
  read(): T
  write(value: T): void
  clear(): void
}

/**
 * A typed, validated storage slot. Corrupt or unexpected data falls back to
 * `fallback` instead of crashing the app.
 */
export function createSlot<T>(
  store: KeyValueStore | undefined,
  options: { key: string; version: number; fallback: T; validate: (value: unknown) => value is T },
): Slot<T> {
  const storageKey = `${NAMESPACE}:${options.key}:v${options.version}`
  return {
    read() {
      if (!store) return options.fallback
      try {
        const raw = store.getItem(storageKey)
        if (raw === null) return options.fallback
        const parsed: unknown = JSON.parse(raw)
        return options.validate(parsed) ? parsed : options.fallback
      } catch {
        return options.fallback
      }
    },
    write(value) {
      try {
        store?.setItem(storageKey, JSON.stringify(value))
      } catch {
        // Quota exceeded or storage disabled (e.g. private mode): ignore.
      }
    },
    clear() {
      store?.removeItem(storageKey)
    },
  }
}

/** `localStorage` if it is available, otherwise `undefined`. */
export function browserStore(): KeyValueStore | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}
