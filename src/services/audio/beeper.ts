import type { Cue } from '@/domain/timer'
import { CUE_TONES, type Tone } from './tones'

/** Plays cue sounds. Implementations must be safe to call at any time. */
export interface Beeper {
  /** Must be called from a user gesture (tap) before sounds can play on iOS. */
  unlock(): Promise<void>
  play(cue: Cue): void
}

const ATTACK_SEC = 0.005
const RELEASE_SEC = 0.04

/**
 * Web Audio beeper. Sounds are synthesized (no audio files to load) and are
 * mixed with whatever else is playing, so music apps keep going.
 */
export function createWebAudioBeeper(win: Window & typeof globalThis = window): Beeper {
  let context: AudioContext | null = null

  const getContext = (): AudioContext | null => {
    if (context) return context
    // Older iOS versions only expose the prefixed constructor.
    const Ctor =
      (win as { AudioContext?: typeof AudioContext }).AudioContext ?? win.webkitAudioContext
    if (!Ctor) return null
    // "ambient" mixes with other audio (e.g. Spotify) instead of pausing it.
    if (win.navigator.audioSession) win.navigator.audioSession.type = 'ambient'
    context = new Ctor({ latencyHint: 'interactive' })
    return context
  }

  const scheduleTone = (ctx: AudioContext, tone: Tone, at: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = at + tone.startSec
    const end = start + tone.durationSec
    osc.type = tone.type
    osc.frequency.setValueAtTime(tone.frequency, start)
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(tone.gain, start + ATTACK_SEC)
    gain.gain.setValueAtTime(tone.gain, Math.max(start + ATTACK_SEC, end - RELEASE_SEC))
    gain.gain.linearRampToValueAtTime(0, end)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(end + 0.01)
  }

  return {
    async unlock() {
      const ctx = getContext()
      if (!ctx) return
      // iOS keeps the context suspended until resumed inside a user gesture;
      // playing a silent buffer finishes the unlock on older WebKit versions.
      const silent = ctx.createBufferSource()
      silent.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
      silent.connect(ctx.destination)
      silent.start()
      if (ctx.state !== 'running') await ctx.resume().catch(() => undefined)
    },
    play(cue) {
      const ctx = getContext()
      if (!ctx) return
      if (ctx.state !== 'running') void ctx.resume().catch(() => undefined)
      const at = ctx.currentTime + 0.01
      for (const tone of CUE_TONES[cue]) scheduleTone(ctx, tone, at)
    },
  }
}

/** A beeper that does nothing; used when muted and in tests. */
export const silentBeeper: Beeper = {
  unlock: () => Promise.resolve(),
  play: () => undefined,
}
