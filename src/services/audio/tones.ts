import type { Cue } from '@/domain/timer'
import { SOUND_LIBRARY } from './sounds'
import type { Tone } from './synth'

/**
 * The sound the app plays for each cue, by id from `SOUND_LIBRARY`.
 * Picked by ear in the sound lab; each one is clearly different so cues can
 * be recognised without looking at the screen.
 */
export const APP_SOUNDS: Readonly<Record<Cue, string>> = {
  countdown: 'ding',
  work: 'bell-chord',
  rest: 'chime',
  done: 'final-bell',
}

function tonesFor(cue: Cue): readonly Tone[] {
  const sound = SOUND_LIBRARY[cue].find((option) => option.id === APP_SOUNDS[cue])
  if (!sound) throw new Error(`Unknown ${cue} sound "${APP_SOUNDS[cue]}"`)
  return sound.tones
}

export const CUE_TONES: Readonly<Record<Cue, readonly Tone[]>> = {
  countdown: tonesFor('countdown'),
  work: tonesFor('work'),
  rest: tonesFor('rest'),
  done: tonesFor('done'),
}
