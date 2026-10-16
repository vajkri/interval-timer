import { DEFAULT_CONFIG } from './config'
import { cuesBetween, type Cue } from './cues'
import { buildSchedule } from './schedule'

// prepare 5s | work 5s | rest 5s | work 5s  → total 20s
const schedule = buildSchedule({
  ...DEFAULT_CONFIG,
  prepareSec: 5,
  workSec: 5,
  restSec: 5,
  exercises: 2,
  rounds: 1,
})

/** Simulates a runner ticking every `stepMs` and collects all cues with their tick time. */
function simulate(stepMs: number): [number, Cue][] {
  const out: [number, Cue][] = []
  let prev = -1
  for (let t = 0; t <= schedule.totalMs + stepMs; t += stepMs) {
    for (const cue of cuesBetween(schedule, prev, t)) out.push([t, cue])
    prev = t
  }
  return out
}

describe('cuesBetween', () => {
  it('beeps 3-2-1 before each phase change and cues each phase and the finish', () => {
    expect(simulate(1000)).toEqual([
      [2000, 'countdown'],
      [3000, 'countdown'],
      [4000, 'countdown'],
      [5000, 'work'],
      [7000, 'countdown'],
      [8000, 'countdown'],
      [9000, 'countdown'],
      [10000, 'rest'],
      [12000, 'countdown'],
      [13000, 'countdown'],
      [14000, 'countdown'],
      [15000, 'work'],
      [17000, 'countdown'],
      [18000, 'countdown'],
      [19000, 'countdown'],
      [20000, 'done'],
    ])
  })

  it('fires each cue exactly once regardless of tick rate', () => {
    const fine = simulate(37).map(([, cue]) => cue)
    const coarse = simulate(1000).map(([, cue]) => cue)
    expect(fine).toEqual(coarse)
  })

  it('cues the first work interval at t=0 when there is no prepare phase', () => {
    const noPrepare = buildSchedule({ ...DEFAULT_CONFIG, prepareSec: 0 })
    expect(cuesBetween(noPrepare, -1, 0)).toEqual(['work'])
  })

  it('returns nothing for an empty or reversed interval', () => {
    expect(cuesBetween(schedule, 5000, 5000)).toEqual([])
    expect(cuesBetween(schedule, 6000, 5000)).toEqual([])
  })

  it('does not countdown-beep before the segment has started', () => {
    const short = buildSchedule({
      ...DEFAULT_CONFIG,
      prepareSec: 0,
      workSec: 2,
      restSec: 0,
      exercises: 1,
      rounds: 1,
    })
    expect(cuesBetween(short, -1, short.totalMs)).toEqual(['work', 'countdown', 'done'])
  })
})
