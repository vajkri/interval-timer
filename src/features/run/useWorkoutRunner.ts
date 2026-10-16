import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useServices } from '@/app/services'
import {
  buildSchedule,
  initialRunState,
  pause as pauseRun,
  positionAt,
  resume as resumeRun,
  skip as skipRun,
  start,
  tick,
  type Position,
  type RunState,
  type Schedule,
  type TimerConfig,
} from '@/domain/timer'

/** How often the runner samples the clock. Also bounds cue latency. */
export const TICK_MS = 50

export interface WorkoutRunner {
  readonly schedule: Schedule
  readonly status: RunState['status']
  readonly position: Position
  readonly pause: () => void
  readonly resume: () => void
  readonly skip: () => void
}

/**
 * Drives a workout: samples the clock, plays cues and keeps the screen awake.
 * All timing logic lives in the pure `domain/timer` runner.
 */
export function useWorkoutRunner(
  config: TimerConfig,
  options: { muted: boolean; onFinish: () => void },
): WorkoutRunner {
  const { beeper, wakeLock, now } = useServices()
  const schedule = useMemo(() => buildSchedule(config), [config])
  const stateRef = useRef<RunState>(initialRunState)
  const [view, setView] = useState<{ status: RunState['status']; position: Position }>(() => ({
    status: 'idle',
    position: positionAt(schedule, 0),
  }))

  // Read the latest options inside the interval without restarting it.
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  const sample = useCallback(() => {
    const result = tick(stateRef.current, schedule, now())
    const finishedNow = result.state.status === 'finished' && stateRef.current.status !== 'finished'
    stateRef.current = result.state
    if (!optionsRef.current.muted)
      result.cues.forEach((cue) => {
        beeper.play(cue)
      })
    setView({ status: result.state.status, position: result.position })
    return finishedNow
  }, [schedule, now, beeper])

  useEffect(() => {
    stateRef.current = start(now())
    void wakeLock.enable()
    sample()
    let finishTimer: ReturnType<typeof setTimeout> | undefined
    const interval = setInterval(() => {
      if (sample()) {
        clearInterval(interval)
        // Let the "done" sound start before leaving the screen.
        finishTimer = setTimeout(() => {
          optionsRef.current.onFinish()
        }, 700)
      }
    }, TICK_MS)
    return () => {
      clearInterval(interval)
      clearTimeout(finishTimer)
      void wakeLock.disable()
    }
  }, [sample, now, wakeLock])

  const update = useCallback(
    (fn: (state: RunState, at: number) => RunState) => {
      stateRef.current = fn(stateRef.current, now())
      sample()
    },
    [now, sample],
  )

  return {
    schedule,
    status: view.status,
    position: view.position,
    pause: useCallback(() => {
      update(pauseRun)
    }, [update]),
    resume: useCallback(() => {
      update(resumeRun)
    }, [update]),
    skip: useCallback(() => {
      update((s, at) => skipRun(s, schedule, at))
    }, [update, schedule]),
  }
}
