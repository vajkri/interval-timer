import type { Cue } from '@/domain/timer'
import { scheduleTones } from './synth'
import { CUE_TONES } from './tones'

/** Plays cue sounds. Implementations must be safe to call at any time. */
export interface Beeper {
  /** Must be called from a user gesture (tap) before sounds can play on iOS. */
  unlock(): Promise<void>
  play(cue: Cue): void
  /**
   * iOS only: `true` plays cues through silent mode but pauses music from
   * other apps; `false` mixes with music but is muted in silent mode.
   */
  setPlayInSilentMode(enabled: boolean): void
}

/**
 * Web Audio beeper. Sounds are synthesized, so there are no audio files to load.
 *
 * On iOS the Audio Session type decides how cues behave (see WebKit's
 * DOMAudioSession.cpp and AudioSessionIOS.mm): "ambient" mixes with music
 * but is muted by the silent switch, and "playback" ignores the switch but
 * interrupts other apps. WebKit has no option that does both.
 */
export function createWebAudioBeeper(win: Window & typeof globalThis = window): Beeper {
  let context: AudioContext | null = null
  let sessionType: AudioSessionType = 'ambient'

  const applySessionType = () => {
    if (win.navigator.audioSession) win.navigator.audioSession.type = sessionType
  }

  const getContext = (): AudioContext | null => {
    if (context) return context
    // Older iOS versions only expose the prefixed constructor.
    const Ctor =
      (win as { AudioContext?: typeof AudioContext }).AudioContext ?? win.webkitAudioContext
    if (!Ctor) return null
    applySessionType()
    context = new Ctor({ latencyHint: 'interactive' })
    return context
  }

  return {
    setPlayInSilentMode(enabled) {
      sessionType = enabled ? 'playback' : 'ambient'
      applySessionType()
    },
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
