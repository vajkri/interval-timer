import { nearestStepIndex, valueSteps } from './steps'

describe('valueSteps', () => {
  it('uses 1s steps up to a minute, then coarser steps', () => {
    const steps = valueSteps('workSec')
    expect(steps.slice(0, 3)).toEqual([1, 2, 3])
    expect(steps).toContain(60)
    expect(steps).toContain(65)
    expect(steps).not.toContain(61)
    expect(steps.at(-1)).toBe(3600)
  })

  it('uses unit steps for counts', () => {
    const steps = valueSteps('rounds')
    expect(steps[0]).toBe(1)
    expect(steps).toHaveLength(100)
  })

  it('finds the nearest step', () => {
    const steps = valueSteps('workSec')
    expect(steps[nearestStepIndex(steps, 62)]).toBe(60)
    expect(steps[nearestStepIndex(steps, 64)]).toBe(65)
  })
})
