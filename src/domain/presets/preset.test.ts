import { DEFAULT_CONFIG } from '@/domain/timer'
import { createPreset, isPreset, sanitizePresetName, sortPresets } from './preset'

const deps = { id: () => 'id-1', now: () => 1000 }

describe('presets', () => {
  it('sanitizes names', () => {
    expect(sanitizePresetName('  Leg \n  day  ')).toBe('Leg day')
    expect(sanitizePresetName('x'.repeat(100))).toHaveLength(40)
  })

  it('creates a preset with a fallback name and normalized config', () => {
    const preset = createPreset('   ', { ...DEFAULT_CONFIG, rounds: 0 }, deps)
    expect(preset).toEqual({
      id: 'id-1',
      name: 'Untitled',
      config: { ...DEFAULT_CONFIG, rounds: 1 },
      updatedAt: 1000,
    })
  })

  it('validates untrusted data', () => {
    expect(isPreset(createPreset('A', DEFAULT_CONFIG, deps))).toBe(true)
    expect(isPreset({ id: 'x', name: 'y', updatedAt: 1, config: { workSec: '20' } })).toBe(false)
    expect(isPreset(null)).toBe(false)
  })

  it('sorts most recent first without mutating input', () => {
    const a = { ...createPreset('A', DEFAULT_CONFIG, deps), updatedAt: 1 }
    const b = { ...createPreset('B', DEFAULT_CONFIG, deps), updatedAt: 2 }
    const input = [a, b]
    expect(sortPresets(input).map((p) => p.name)).toEqual(['B', 'A'])
    expect(input[0]).toBe(a)
  })
})
