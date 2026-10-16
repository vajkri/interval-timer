import { formatClock } from './format'

describe('formatClock', () => {
  it.each([
    [0, '00:00'],
    [1, '00:01'],
    [999, '00:01'],
    [1000, '00:01'],
    [61_000, '01:01'],
    [290_000, '04:50'],
    [3_600_000, '1:00:00'],
    [-500, '00:00'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatClock(ms)).toBe(expected)
  })
})
