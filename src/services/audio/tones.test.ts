import { SOUND_LIBRARY } from './sounds'
import { APP_SOUNDS, CUE_TONES } from './tones'

describe('cue sounds', () => {
  it('uses a sound from the library for every cue', () => {
    for (const [cue, id] of Object.entries(APP_SOUNDS)) {
      expect(SOUND_LIBRARY[cue as keyof typeof APP_SOUNDS].map((o) => o.id)).toContain(id)
    }
  })

  it('gives every cue a different sound so they are recognisable by ear', () => {
    const sounds = Object.values(CUE_TONES)
    expect(new Set(sounds).size).toBe(sounds.length)
  })

  it('has unique ids within each cue', () => {
    for (const options of Object.values(SOUND_LIBRARY)) {
      const ids = options.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
