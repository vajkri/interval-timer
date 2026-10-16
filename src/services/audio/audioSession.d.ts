// Audio Session API (Safari 17+). Not yet part of TypeScript's DOM lib.
// https://w3c.github.io/audio-session/
type AudioSessionType =
  'auto' | 'playback' | 'transient' | 'transient-solo' | 'ambient' | 'play-and-record'

interface AudioSession extends EventTarget {
  type: AudioSessionType
}

interface Navigator {
  readonly audioSession?: AudioSession
}

interface Window {
  webkitAudioContext?: typeof AudioContext
}
