/** A single synthesized note, relative to the start of the sound. */
export interface Tone {
  readonly frequency: number
  readonly startSec: number
  readonly durationSec: number
  readonly type: OscillatorType
  /** Peak gain, 0 → 1. */
  readonly gain: number
  /** If set, the pitch glides to this frequency over the note (chirps, whistles). */
  readonly endFrequency?: number
  /** "sustain" holds the level then cuts off (beeps); "decay" fades out like a bell. */
  readonly envelope?: 'sustain' | 'decay'
}

export const note = (
  frequency: number,
  startSec: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  gain = 0.6,
  extra: Pick<Tone, 'endFrequency' | 'envelope'> = {},
): Tone => ({ frequency, startSec, durationSec, type, gain, ...extra })

const ATTACK_SEC = 0.005
const RELEASE_SEC = 0.04
const SILENT = 0.0001

/** Schedules `tones` on `ctx`, starting at context time `at`. */
export function scheduleTones(
  ctx: BaseAudioContext,
  destination: AudioNode,
  tones: readonly Tone[],
  at: number,
): void {
  for (const tone of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = at + tone.startSec
    const end = start + tone.durationSec
    osc.type = tone.type
    osc.frequency.setValueAtTime(tone.frequency, start)
    if (tone.endFrequency !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(tone.endFrequency, end)
    }
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(tone.gain, start + ATTACK_SEC)
    if (tone.envelope === 'decay') {
      gain.gain.exponentialRampToValueAtTime(SILENT, end)
    } else {
      gain.gain.setValueAtTime(tone.gain, Math.max(start + ATTACK_SEC, end - RELEASE_SEC))
      gain.gain.linearRampToValueAtTime(0, end)
    }
    osc.connect(gain).connect(destination)
    osc.start(start)
    osc.stop(end + 0.01)
  }
}
