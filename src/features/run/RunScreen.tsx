import { formatClock, type TimerConfig } from '@/domain/timer'
import { Button } from '@/ui/Button'
import { PHASE_LABEL } from '@/ui/fields'
import { MuteIcon, PauseIcon, PlayIcon, SkipIcon, SoundIcon, StopIcon } from '@/ui/icons'
import { ProgressRing } from './ProgressRing'
import { useWorkoutRunner } from './useWorkoutRunner'
import styles from './RunScreen.module.css'

interface Props {
  config: TimerConfig
  onExit: () => void
  onFinish: () => void
  muted: boolean
  onToggleMuted: () => void
}

export function RunScreen({ config, onExit, onFinish, muted, onToggleMuted }: Props) {
  const runner = useWorkoutRunner(config, { muted, onFinish })
  const { position, status } = runner
  const paused = status === 'paused'

  if (position.status === 'finished') {
    return (
      <main className={`${styles.screen} tone-work`}>
        <p className={styles.phase}>Done!</p>
      </main>
    )
  }

  const { segment, segmentRemainingMs, segmentProgress, totalRemainingMs, segmentIndex } = position
  const next = runner.schedule.segments[segmentIndex + 1]

  return (
    <main className={`${styles.screen} tone-${segment.kind}`} data-phase={segment.kind}>
      <header className={styles.header}>
        <p className={styles.phase} aria-live="polite">
          {PHASE_LABEL[segment.kind]}
        </p>
        <dl className={styles.counters}>
          <div>
            <dt>Exercise</dt>
            <dd>
              {segment.exerciseIndex + 1}/{config.exercises}
            </dd>
          </div>
          <div>
            <dt>Round</dt>
            <dd>
              {segment.roundIndex + 1}/{config.rounds}
            </dd>
          </div>
        </dl>
      </header>

      <ProgressRing progress={segmentProgress}>
        <p className={styles.clock} role="timer" aria-label="Time left in this phase">
          {formatClock(segmentRemainingMs)}
        </p>
        {next && (
          <p className={styles.next}>
            Next: {PHASE_LABEL[next.kind]} {formatClock(next.durationMs)}
          </p>
        )}
      </ProgressRing>

      <footer className={styles.footer}>
        <div className={styles.controls}>
          <Button
            variant="round"
            className={styles.small}
            onClick={onToggleMuted}
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
          >
            {muted ? <MuteIcon /> : <SoundIcon />}
          </Button>
          <Button
            variant="round"
            className={styles.main}
            onClick={paused ? runner.resume : runner.pause}
            aria-label={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <PlayIcon width={36} height={36} /> : <PauseIcon width={36} height={36} />}
          </Button>
          {paused ? (
            <Button
              variant="round"
              className={styles.small}
              onClick={onExit}
              aria-label="End workout"
            >
              <StopIcon />
            </Button>
          ) : (
            <Button
              variant="round"
              className={styles.small}
              onClick={runner.skip}
              aria-label="Skip to next phase"
            >
              <SkipIcon />
            </Button>
          )}
        </div>
        <p className={styles.remaining}>
          {paused ? 'Paused · ' : ''}Total left <strong>{formatClock(totalRemainingMs)}</strong>
        </p>
      </footer>
    </main>
  )
}
