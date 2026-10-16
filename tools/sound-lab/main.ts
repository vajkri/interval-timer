import type { Cue } from '@/domain/timer'
import {
  DEFAULT_SOUND_SET,
  SOUND_LIBRARY,
  SOUND_SETS,
  getSoundSet,
  scheduleTones,
  type SoundOption,
} from '@/services/audio'

const CUES: readonly { cue: Cue; label: string; hint: string }[] = [
  { cue: 'countdown', label: 'Countdown', hint: 'Plays at 3, 2 and 1 seconds before every change' },
  { cue: 'work', label: 'Work starts', hint: 'Should say "go!"' },
  { cue: 'rest', label: 'Rest starts', hint: 'Should say "relax"' },
  { cue: 'done', label: 'Workout done', hint: 'The finish line' },
]

const STORAGE_KEY = 'interval-timer:sound-lab:v2'

const $ = (selector: string): HTMLElement => {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el) throw new Error(`Missing ${selector}`)
  return el
}

// --- Audio ---------------------------------------------------------------

let ctx: AudioContext | null = null
let master: GainNode | null = null
const volume = $('#volume') as HTMLInputElement
const silentMode = $('#silent') as HTMLInputElement

// Same trade-off as the app setting: see services/audio/beeper.ts.
const applySessionType = () => {
  if (navigator.audioSession)
    navigator.audioSession.type = silentMode.checked ? 'playback' : 'ambient'
}
silentMode.addEventListener('change', applySessionType)

function audio(): { ctx: AudioContext; out: GainNode } {
  if (!ctx || !master) {
    applySessionType()
    ctx = new AudioContext({ latencyHint: 'interactive' })
    master = ctx.createGain()
    master.connect(ctx.destination)
  }
  master.gain.value = Number(volume.value)
  if (ctx.state !== 'running') void ctx.resume()
  return { ctx, out: master }
}

function play(option: SoundOption | undefined, delaySec = 0) {
  if (!option) return
  const { ctx: c, out } = audio()
  scheduleTones(c, out, option.tones, c.currentTime + 0.02 + delaySec)
}

volume.addEventListener('input', () => {
  if (master) master.gain.value = Number(volume.value)
})

// --- Selection state -----------------------------------------------------

type Picks = Record<Cue, string>

/** Picks start from the app's default sound set. */
function defaultPicks(): Picks {
  return { ...getSoundSet(DEFAULT_SOUND_SET).sounds }
}

function loadPicks(): Picks {
  const picks = defaultPicks()
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (typeof stored === 'object' && stored !== null) {
      for (const { cue } of CUES) {
        const id = (stored as Record<string, unknown>)[cue]
        if (typeof id === 'string' && SOUND_LIBRARY[cue].some((o) => o.id === id)) picks[cue] = id
      }
    }
  } catch {
    // Ignore corrupt storage and fall back to defaults.
  }
  return picks
}

const picks = loadPicks()

const picked = (cue: Cue): SoundOption | undefined =>
  SOUND_LIBRARY[cue].find((o) => o.id === picks[cue]) ?? SOUND_LIBRARY[cue][0]

function renderChoice() {
  const lines = CUES.map(({ cue }) => `${cue}: ${picks[cue]}  (${picked(cue)?.name ?? '?'})`)
  $('#choice').textContent = `Sound picks\n${lines.join('\n')}`
  localStorage.setItem(STORAGE_KEY, JSON.stringify(picks))
}

// --- UI ------------------------------------------------------------------

function render() {
  const root = $('#cues')
  for (const { cue, label, hint } of CUES) {
    const section = document.createElement('section')
    section.className = `cue cue-${cue}`
    const heading = document.createElement('h2')
    heading.textContent = label
    const sub = document.createElement('p')
    sub.className = 'hint'
    sub.textContent = hint
    const list = document.createElement('div')
    list.className = 'options'
    list.setAttribute('role', 'radiogroup')
    list.setAttribute('aria-label', label)

    for (const [i, option] of SOUND_LIBRARY[cue].entries()) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'option'
      button.setAttribute('role', 'radio')
      button.dataset.cue = cue
      button.dataset.id = option.id
      const num = document.createElement('span')
      num.className = 'num'
      num.textContent = String(i + 1)
      const name = document.createElement('span')
      name.className = 'name'
      name.textContent = option.name
      const desc = document.createElement('span')
      desc.className = 'desc'
      desc.textContent = option.description
      for (const set of SOUND_SETS.filter((s) => s.sounds[cue] === option.id)) {
        const badge = document.createElement('span')
        badge.className = 'badge'
        badge.textContent = set.name
        name.append(' ', badge)
      }
      button.append(num, name, desc)
      button.addEventListener('click', () => {
        picks[cue] = option.id
        play(option)
        syncSelection()
        renderChoice()
      })
      list.append(button)
    }
    section.append(heading, sub, list)
    root.append(section)
  }
}

function syncSelection() {
  document.querySelectorAll<HTMLButtonElement>('.option').forEach((button) => {
    const cue = button.dataset.cue as Cue
    const selected = picks[cue] === button.dataset.id
    button.setAttribute('aria-checked', String(selected))
  })
}

/** A short workout: countdown → work, countdown → rest, countdown → work, countdown → done. */
function playSequence() {
  const steps: [Cue, number][] = []
  let t = 0
  for (const phase of ['work', 'rest', 'work', 'done'] as const) {
    for (let i = 0; i < 3; i++) steps.push(['countdown', t + i])
    steps.push([phase, t + 3])
    t += 5
  }
  for (const [cue, at] of steps) play(picked(cue), at)
}

/** Buttons that load an app sound set into the picks. */
function renderSetButtons() {
  const toolbar = $('.toolbar')
  for (const set of SOUND_SETS) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'set-button'
    button.textContent = `Load ${set.name}`
    button.addEventListener('click', () => {
      Object.assign(picks, set.sounds)
      syncSelection()
      renderChoice()
      playSequence()
    })
    toolbar.append(button)
  }
}

render()
renderSetButtons()
syncSelection()
renderChoice()

$('#sequence').addEventListener('click', playSequence)
$('#copy').addEventListener('click', () => {
  void navigator.clipboard.writeText($('#choice').textContent).then(() => {
    $('#copy').textContent = 'Copied ✓'
  })
})
