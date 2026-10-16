import { DEFAULT_CONFIG } from './config'
import { positionAt } from './position'
import { buildSchedule } from './schedule'

const schedule = buildSchedule({
  ...DEFAULT_CONFIG,
  prepareSec: 5,
  workSec: 20,
  restSec: 10,
  exercises: 2,
  rounds: 1,
})

describe('positionAt', () => {
  it('starts in the prepare phase', () => {
    const pos = positionAt(schedule, 0)
    expect(pos.status === 'running' && pos.segment.kind).toBe('prepare')
  })

  it('moves to work exactly at the boundary', () => {
    const pos = positionAt(schedule, 5000)
    expect(pos).toMatchObject({ status: 'running', segmentIndex: 1, segmentRemainingMs: 20000 })
  })

  it('reports progress and remaining time inside a segment', () => {
    const pos = positionAt(schedule, 5000 + 15000)
    expect(pos).toMatchObject({
      status: 'running',
      segmentProgress: 0.75,
      segmentRemainingMs: 5000,
      totalRemainingMs: schedule.totalMs - 20000,
    })
  })

  it('finishes at the total duration', () => {
    expect(positionAt(schedule, schedule.totalMs)).toEqual({ status: 'finished' })
  })

  it('treats negative time as the start', () => {
    const pos = positionAt(schedule, -100)
    expect(pos.status === 'running' && pos.segmentIndex).toBe(0)
  })
})
