import type { Cue } from '@/domain/timer'

/** A single synthesized note, relative to the start of the cue. */
export interface Tone {
  readonly frequency: number
  readonly startSec: number
  readonly durationSec: number
  readonly type: OscillatorType
  /** Peak gain, 0 → 1. */
  readonly gain: number
}

const note = (
  frequency: number,
  startSec: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  gain = 0.6,
): Tone => ({ frequency, startSec, durationSec, type, gain })

/**
 * Each cue has a clearly different sound so it can be recognised without
 * looking at the screen:
 * - countdown: short neutral blip
 * - work: bright, rising double beep ("go!")
 * - rest: soft, falling double tone ("relax")
 * - done: rising major arpeggio
 */
export const CUE_TONES: Readonly<Record<Cue, readonly Tone[]>> = {
  countdown: [note(880, 0, 0.12, 'sine', 0.5)],
  work: [note(988, 0, 0.14, 'square', 0.35), note(1319, 0.16, 0.32, 'square', 0.35)],
  rest: [note(784, 0, 0.22, 'triangle', 0.7), note(523, 0.24, 0.42, 'triangle', 0.7)],
  done: [
    note(523, 0, 0.16, 'triangle', 0.7),
    note(659, 0.17, 0.16, 'triangle', 0.7),
    note(784, 0.34, 0.16, 'triangle', 0.7),
    note(1047, 0.51, 0.6, 'triangle', 0.7),
  ],
}
