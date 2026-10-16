import type { Cue } from '@/domain/timer'
import { scheduleTones } from './synth'
import { CUE_TONES } from './tones'

/** Plays cue sounds. Implementations must be safe to call at any time. */
export interface Beeper {
  /** Must be called from a user gesture (tap) before sounds can play on iOS. */
  unlock(): Promise<void>
  play(cue: Cue): void
}

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
      scheduleTones(ctx, ctx.destination, CUE_TONES[cue], at)
    },
  }
}

/** A beeper that does nothing; used when muted and in tests. */
export const silentBeeper: Beeper = {
  unlock: () => Promise.resolve(),
  play: () => undefined,
}
