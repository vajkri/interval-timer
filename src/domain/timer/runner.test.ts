import { DEFAULT_CONFIG } from './config'
import { MAX_CUE_GAP_MS, elapsedMs, pause, resume, skip, start, tick } from './runner'
import { buildSchedule } from './schedule'

// prepare 3s | work 5s | rest 5s | work 5s → 18s
const schedule = buildSchedule({
  ...DEFAULT_CONFIG,
  prepareSec: 3,
  workSec: 5,
  restSec: 5,
  exercises: 2,
  rounds: 1,
})

describe('runner', () => {
  it('derives elapsed time from the clock, not from ticks', () => {
    const s = start(1000)
    expect(elapsedMs(s, 1000)).toBe(0)
    expect(elapsedMs(s, 4500)).toBe(3500)
  })

  it('does not count paused time', () => {
    let s = start(0)
    s = pause(s, 2000)
    expect(elapsedMs(s, 60_000)).toBe(2000)
    s = resume(s, 60_000)
    expect(elapsedMs(s, 61_000)).toBe(3000)
  })

  it('emits cues while running and nothing while paused', () => {
    let s = start(0)
    const first = tick(s, schedule, 0)
    s = first.state
    // prepare: countdown at 0s (3s left) is not emitted because it coincides with the segment start.
    const atWork = tick(s, schedule, 1000)
    expect(atWork.cues).toEqual(['countdown'])
    const paused = pause(atWork.state, 1000)
    expect(tick(paused, schedule, 5000).cues).toEqual([])
  })

  it('drops the cue backlog after a long gap', () => {
    const s = start(0)
    const result = tick(tick(s, schedule, 0).state, schedule, MAX_CUE_GAP_MS + 5000)
    expect(result.cues).toEqual([])
    expect(result.position.status).toBe('running')
  })

  it('finishes with a done cue even after a long gap', () => {
    const s = tick(start(0), schedule, 0).state
    const result = tick(s, schedule, 999_999)
    expect(result.state.status).toBe('finished')
    expect(result.cues).toEqual(['done'])
  })

  it('skips to the next segment and announces it', () => {
    let s = tick(start(0), schedule, 0).state
    s = skip(s, schedule, 500)
    expect(elapsedMs(s, 500)).toBe(3000)
    const result = tick(s, schedule, 500)
    expect(result.cues).toEqual(['work'])
    expect(result.position.status === 'running' && result.position.segment.kind).toBe('work')
  })
})
