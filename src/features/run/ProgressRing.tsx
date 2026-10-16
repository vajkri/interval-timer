import styles from './ProgressRing.module.css'

const SIZE = 100
const STROKE = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Circular progress; `progress` runs 0 → 1 and the ring empties as time passes. */
export function ProgressRing({
  progress,
  children,
}: {
  progress: number
  children: React.ReactNode
}) {
  const offset = CIRCUMFERENCE * Math.min(1, Math.max(0, progress))
  return (
    <div className={styles.ring}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" className={styles.svg}>
        <circle
          className={styles.track}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
        />
        <circle
          className={styles.bar}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
