import { SOUND_LIBRARY } from './sounds'
import { DEFAULT_SOUND_SET, SOUND_SETS, isSoundSetId, soundSetTones } from './soundSets'

describe('sound sets', () => {
  it.each(SOUND_SETS.map((set) => [set.id, set] as const))(
    '%s uses existing, distinct sounds for every cue',
    (id) => {
      const tones = Object.values(soundSetTones(id))
      expect(tones).toHaveLength(4)
      // Different sounds per cue, so cues are recognisable by ear.
      expect(new Set(tones).size).toBe(tones.length)
    },
  )

  it('defaults to Bells', () => {
    expect(DEFAULT_SOUND_SET).toBe('bells')
  })

  it('validates set ids', () => {
    expect(isSoundSetId('beeps')).toBe(true)
    expect(isSoundSetId('nope')).toBe(false)
  })

  it('has unique sound ids within each cue', () => {
    for (const options of Object.values(SOUND_LIBRARY)) {
      const ids = options.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
