import { DEFAULT_CONFIG } from '@/domain/timer'
import { createRepositories } from './repositories'
import { createSlot, type KeyValueStore } from './storage'

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
  }
}

const isNumber = (v: unknown): v is number => typeof v === 'number'

describe('createSlot', () => {
  it('round-trips values under a namespaced, versioned key', () => {
    const store = memoryStore()
    const slot = createSlot(store, { key: 'n', version: 2, fallback: 0, validate: isNumber })
    slot.write(42)
    expect(store.data.get('interval-timer:n:v2')).toBe('42')
    expect(slot.read()).toBe(42)
  })

  it('falls back on corrupt JSON or invalid shape', () => {
    const store = memoryStore()
    const slot = createSlot(store, { key: 'n', version: 1, fallback: 7, validate: isNumber })
    store.setItem('interval-timer:n:v1', '{not json')
    expect(slot.read()).toBe(7)
    store.setItem('interval-timer:n:v1', '"a string"')
    expect(slot.read()).toBe(7)
  })

  it('works without storage', () => {
    const slot = createSlot(undefined, { key: 'n', version: 1, fallback: 1, validate: isNumber })
    slot.write(5)
    expect(slot.read()).toBe(1)
  })

  it('swallows write errors such as quota exceeded', () => {
    const store = memoryStore()
    store.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    const slot = createSlot(store, { key: 'n', version: 1, fallback: 1, validate: isNumber })
    expect(() => {
      slot.write(5)
    }).not.toThrow()
  })
})

describe('createRepositories', () => {
  it('normalizes the stored last config', () => {
    const store = memoryStore()
    const repos = createRepositories(store)
    repos.lastConfig.write({ ...DEFAULT_CONFIG, rounds: 999 })
    expect(repos.lastConfig.read().rounds).toBe(100)
  })

  it('reads settings saved before playInSilentMode existed', () => {
    const store = memoryStore()
    store.setItem('interval-timer:settings:v1', JSON.stringify({ muted: true }))
    expect(createRepositories(store).settings.read()).toEqual({
      muted: true,
      playInSilentMode: false,
    })
  })
})
