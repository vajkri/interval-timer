import type { Cue } from '@/domain/timer'
import { SOUND_LIBRARY } from './sounds'
import type { Tone } from './synth'

export type SoundSetId = 'bells' | 'beeps'

/** A coherent choice of one sound per cue, selectable in Settings. */
export interface SoundSet {
  readonly id: SoundSetId
  readonly name: string
  readonly description: string
  /** Sound id from `SOUND_LIBRARY` for each cue. */
  readonly sounds: Readonly<Record<Cue, string>>
}

export const SOUND_SETS: readonly SoundSet[] = [
  {
    id: 'bells',
    name: 'Bells',
    description: 'Soft, ringing bells and chimes',
    sounds: { countdown: 'ding', work: 'bell-chord', rest: 'chime', done: 'final-bell' },
  },
  {
    id: 'beeps',
    name: 'Beeps',
    description: 'Sharp electronic beeps that cut through music',
    sounds: { countdown: 'pip', work: 'go-double', rest: 'beep-down', done: 'beep-finish' },
  },
]

export const DEFAULT_SOUND_SET: SoundSetId = 'bells'

export function isSoundSetId(value: unknown): value is SoundSetId {
  return SOUND_SETS.some((set) => set.id === value)
}

export function getSoundSet(id: SoundSetId): SoundSet {
  const set = SOUND_SETS.find((s) => s.id === id)
  if (!set) throw new Error(`Unknown sound set "${id}"`)
  return set
}

/** Resolves a set's sound ids to the tones to play. */
export function soundSetTones(id: SoundSetId): Readonly<Record<Cue, readonly Tone[]>> {
  const { sounds } = getSoundSet(id)
  const tonesFor = (cue: Cue) => {
    const sound = SOUND_LIBRARY[cue].find((option) => option.id === sounds[cue])
    if (!sound) throw new Error(`Unknown ${cue} sound "${sounds[cue]}" in set "${id}"`)
    return sound.tones
  }
  return {
    countdown: tonesFor('countdown'),
    work: tonesFor('work'),
    rest: tonesFor('rest'),
    done: tonesFor('done'),
  }
}
