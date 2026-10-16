import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFakeServices, renderWithServices } from '@/test/fakeServices'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the total workout time for the default setup', () => {
    renderWithServices(<App />)
    expect(screen.getByLabelText('Total workout time')).toHaveTextContent('04:50')
  })

  it('edits a value with the picker and updates the total', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithServices(<App />)
    await user.click(screen.getByRole('button', { name: /^Rounds/ }))
    await user.click(screen.getByRole('button', { name: 'Increase' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByRole('button', { name: /^Rounds/ })).toHaveTextContent('3×')
    expect(screen.getByLabelText('Total workout time')).toHaveTextContent('07:20')
  })

  it('runs a workout through its phases, beeping and keeping the screen awake', async () => {
    const { services, clock, played } = createFakeServices()
    services.repositories.lastConfig.write({
      prepareSec: 3,
      workSec: 3,
      restSec: 3,
      exercises: 2,
      rounds: 1,
      roundResetSec: 0,
    })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithServices(<App />, services)

    await user.click(screen.getByRole('button', { name: 'Start workout' }))
    expect(screen.getByRole('main')).toHaveAttribute('data-phase', 'prepare')
    expect(services.wakeLock.enable).toHaveBeenCalled()

    const advance = async (ms: number) => {
      for (let t = 0; t < ms; t += 50) {
        clock.now += 50
        await act(() => vi.advanceTimersByTimeAsync(50))
      }
    }

    await advance(3000)
    expect(screen.getByRole('main')).toHaveAttribute('data-phase', 'work')
    await advance(3000)
    expect(screen.getByRole('main')).toHaveAttribute('data-phase', 'rest')
    await advance(3000)
    expect(screen.getByRole('main')).toHaveAttribute('data-phase', 'work')
    await advance(3000 + 1000)

    expect(await screen.findByText('Workout complete')).toBeInTheDocument()
    expect(services.wakeLock.disable).toHaveBeenCalled()
    expect(played).toEqual([
      'countdown',
      'countdown',
      'work',
      'countdown',
      'countdown',
      'rest',
      'countdown',
      'countdown',
      'work',
      'countdown',
      'countdown',
      'done',
    ])
  })

  it('saves the finished workout as a preset', async () => {
    const { services, clock } = createFakeServices()
    services.repositories.lastConfig.write({
      prepareSec: 0,
      workSec: 1,
      restSec: 0,
      exercises: 1,
      rounds: 1,
      roundResetSec: 0,
    })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithServices(<App />, services)
    await user.click(screen.getByRole('button', { name: 'Start workout' }))
    for (let t = 0; t < 2000; t += 50) {
      clock.now += 50
      await act(() => vi.advanceTimersByTimeAsync(50))
    }
    await user.type(await screen.findByLabelText(/Save this workout/), 'Quick one')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Saved in your presets.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    await user.click(screen.getByRole('button', { name: 'Presets' }))
    expect(screen.getByText('Quick one')).toBeInTheDocument()
  })

  it('switches the audio mode from settings and remembers it', async () => {
    const { services, played } = createFakeServices()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithServices(<App />, services)
    expect(services.beeper.setPlayInSilentMode).toHaveBeenLastCalledWith(false)

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    const toggle = screen.getByRole('switch', { name: 'Play sounds in silent mode' })
    expect(toggle).not.toBeChecked()
    await user.click(toggle)
    expect(toggle).toBeChecked()
    expect(services.beeper.setPlayInSilentMode).toHaveBeenLastCalledWith(true)
    expect(services.repositories.settings.read().playInSilentMode).toBe(true)

    await user.click(screen.getByRole('button', { name: /Test sound/ }))
    expect(played).toEqual(['countdown', 'countdown', 'countdown', 'work', 'rest', 'done'])
  })

  it('switches to the Beeps sound set and previews it', async () => {
    const { services, played } = createFakeServices()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithServices(<App />, services)
    expect(services.beeper.setSoundSet).toHaveBeenLastCalledWith('bells')

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('radio', { name: /Bells/ })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: /Beeps/ }))

    expect(screen.getByRole('radio', { name: /Beeps/ })).toBeChecked()
    expect(services.beeper.setSoundSet).toHaveBeenLastCalledWith('beeps')
    expect(services.repositories.settings.read().soundSet).toBe('beeps')
    expect(played).toHaveLength(6)
  })
})
