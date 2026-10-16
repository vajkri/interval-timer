import type { Cue } from '@/domain/timer'
import { CUE_TONES, note, type Tone } from '@/services/audio'

export interface SoundOption {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly tones: readonly Tone[]
}

/** Bell-like strike: a decaying fundamental plus an inharmonic overtone. */
const bell = (frequency: number, startSec: number, durationSec: number, gain = 0.5): Tone[] => [
  note(frequency, startSec, durationSec, 'sine', gain, { envelope: 'decay' }),
  note(frequency * 2.76, startSec, durationSec * 0.6, 'sine', gain * 0.35, { envelope: 'decay' }),
  note(frequency * 5.4, startSec, durationSec * 0.3, 'sine', gain * 0.15, { envelope: 'decay' }),
]

/** Option 1 of each cue is always what the app plays today. */
export const SOUND_OPTIONS: Readonly<Record<Cue, readonly SoundOption[]>> = {
  countdown: [
    {
      id: 'blip',
      name: 'Blip (current)',
      description: 'Short, neutral sine beep',
      tones: CUE_TONES.countdown,
    },
    {
      id: 'tick',
      name: 'Wood tick',
      description: 'Dry, percussive click',
      tones: [note(1600, 0, 0.04, 'square', 0.3, { envelope: 'decay', endFrequency: 900 })],
    },
    {
      id: 'ding',
      name: 'Soft ding',
      description: 'Small bell, gentle',
      tones: bell(1319, 0, 0.35, 0.45),
    },
    {
      id: 'tock',
      name: 'Low tock',
      description: 'Deep and calm, easy on the ears',
      tones: [note(440, 0, 0.11, 'triangle', 0.8)],
    },
    {
      id: 'pip',
      name: 'Digital pip',
      description: 'Sharp sports-watch pip',
      tones: [note(2093, 0, 0.07, 'square', 0.22)],
    },
  ],
  work: [
    {
      id: 'go-double',
      name: 'Go double (current)',
      description: 'Bright rising double beep',
      tones: CUE_TONES.work,
    },
    {
      id: 'boxing-bell',
      name: 'Boxing bell',
      description: 'Three quick ring strikes',
      tones: [
        ...bell(880, 0, 0.6, 0.55),
        ...bell(880, 0.14, 0.6, 0.55),
        ...bell(880, 0.28, 0.9, 0.55),
      ],
    },
    {
      id: 'whistle',
      name: 'Coach whistle',
      description: 'Upward chirp',
      tones: [note(1400, 0, 0.32, 'sine', 0.6, { endFrequency: 2800 })],
    },
    {
      id: 'triple-go',
      name: 'Triple go',
      description: 'Three fast high beeps',
      tones: [0, 0.12, 0.24].map((t) => note(1319, t, 0.08, 'square', 0.3)),
    },
    {
      id: 'power',
      name: 'Power chord',
      description: 'Big, buzzy "let\'s go"',
      tones: [330, 415, 494, 660].map((f) =>
        note(f, 0, 0.55, 'sawtooth', 0.14, { envelope: 'decay' }),
      ),
    },
  ],
  rest: [
    {
      id: 'fall-double',
      name: 'Falling double (current)',
      description: 'Soft falling two-tone',
      tones: CUE_TONES.rest,
    },
    {
      id: 'glide-down',
      name: 'Glide down',
      description: 'One smooth downward sweep',
      tones: [note(880, 0, 0.6, 'sine', 0.6, { endFrequency: 330, envelope: 'decay' })],
    },
    {
      id: 'chime',
      name: 'Two chimes',
      description: 'Calm descending bells',
      tones: [...bell(659, 0, 0.7), ...bell(523, 0.25, 1)],
    },
    {
      id: 'low-double',
      name: 'Low double',
      description: 'Two deep, round beeps',
      tones: [note(392, 0, 0.16, 'triangle', 0.85), note(392, 0.22, 0.3, 'triangle', 0.85)],
    },
    {
      id: 'gong',
      name: 'Soft gong',
      description: 'One long, low ring',
      tones: bell(262, 0, 1.6, 0.7),
    },
  ],
  done: [
    {
      id: 'arpeggio',
      name: 'Arpeggio (current)',
      description: 'Rising major arpeggio',
      tones: CUE_TONES.done,
    },
    {
      id: 'ta-da',
      name: 'Ta-da',
      description: 'Short-long fanfare',
      tones: [
        ...[523, 659, 784].map((f) => note(f, 0, 0.12, 'square', 0.12)),
        ...[523, 659, 784, 1047].map((f) =>
          note(f, 0.16, 0.9, 'square', 0.1, { envelope: 'decay' }),
        ),
      ],
    },
    {
      id: 'bell-chord',
      name: 'Bell chord',
      description: 'Warm, ringing chord',
      tones: [
        ...bell(523, 0, 1.8, 0.35),
        ...bell(659, 0.05, 1.8, 0.3),
        ...bell(784, 0.1, 1.8, 0.3),
      ],
    },
    {
      id: 'final-bell',
      name: 'Final bell',
      description: 'Boxing bell, rung longer',
      tones: [0, 0.18, 0.36, 0.54, 0.72].flatMap((t) => bell(880, t, 0.8, 0.5)),
    },
    {
      id: 'victory',
      name: 'Victory run',
      description: 'Fast run up two octaves',
      tones: [523, 659, 784, 1047, 1319, 1568, 2093].map((f, i) =>
        note(
          f,
          i * 0.07,
          i === 6 ? 0.7 : 0.09,
          'triangle',
          0.6,
          i === 6 ? { envelope: 'decay' } : {},
        ),
      ),
    },
  ],
}
