import { DEFAULT_CONFIG, type TimerConfig } from './config'
import { buildSchedule, workoutSeconds } from './schedule'

const config = (overrides: Partial<TimerConfig> = {}): TimerConfig => ({
  ...DEFAULT_CONFIG,
  ...overrides,
})

describe('buildSchedule', () => {
  it('matches the reference app total (20s work, 10s rest, 5 exercises, 2 rounds, 10s reset = 04:50)', () => {
    expect(workoutSeconds(config())).toBe(290)
  })

  it('orders segments prepare → work/rest → round reset → work/rest', () => {
    const { segments } = buildSchedule(
      config({ prepareSec: 5, exercises: 2, rounds: 2, workSec: 3, restSec: 2, roundResetSec: 4 }),
    )
    expect(segments.map((s) => s.kind)).toEqual([
      'prepare',
      'work',
      'rest',
      'work',
      'roundReset',
      'work',
      'rest',
      'work',
    ])
  })

  it('lays segments end to end without gaps', () => {
    const { segments, totalMs } = buildSchedule(config())
    segments.forEach((segment, i) => {
      const prev = segments[i - 1]
      expect(segment.startMs).toBe(prev ? prev.startMs + prev.durationMs : 0)
    })
    const last = segments.at(-1)!
    expect(last.startMs + last.durationMs).toBe(totalMs)
  })

  it('omits zero-length phases', () => {
    const { segments } = buildSchedule(
      config({ prepareSec: 0, restSec: 0, roundResetSec: 0, exercises: 2, rounds: 2 }),
    )
    expect(segments.every((s) => s.kind === 'work')).toBe(true)
    expect(segments).toHaveLength(4)
  })

  it('tracks exercise and round indices', () => {
    const { segments } = buildSchedule(config({ prepareSec: 0, exercises: 2, rounds: 2 }))
    const work = segments.filter((s) => s.kind === 'work')
    expect(work.map((s) => [s.roundIndex, s.exerciseIndex])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ])
  })

  it('clamps invalid input instead of producing a broken schedule', () => {
    const { segments } = buildSchedule(config({ workSec: -5, exercises: 0, rounds: Number.NaN }))
    expect(segments.filter((s) => s.kind === 'work')).toHaveLength(1)
    expect(segments.find((s) => s.kind === 'work')?.durationMs).toBe(1000)
  })
})
