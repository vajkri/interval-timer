import { useEffect, useMemo, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { nearestStepIndex, valueSteps, type TimerField } from '@/domain/timer'
import { Button } from '@/ui/Button'
import { FIELD_META } from '@/ui/fields'
import { MinusIcon, PlusIcon } from '@/ui/icons'
import { formatFieldValue } from './formatFieldValue'
import styles from './ValuePicker.module.css'

interface Props {
  field: TimerField
  value: number
  onChange: (value: number) => void
  onClose: () => void
}

/** Vertical distance in px that moves the value by one step while dragging. */
const PX_PER_STEP = 14

/**
 * Full-screen picker: drag anywhere on the ruler (up = more), tap +/-, or
 * use arrow keys. Changes apply immediately.
 */
export function ValuePicker({ field, value, onChange, onClose }: Props) {
  const meta = FIELD_META[field]
  const steps = useMemo(() => valueSteps(field), [field])
  const index = nearestStepIndex(steps, value)
  const drag = useRef<{ startY: number; startIndex: number } | null>(null)
  const doneRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    doneRef.current?.focus()
  }, [])

  const setIndex = (next: number) => {
    const clamped = Math.min(steps.length - 1, Math.max(0, next))
    const nextValue = steps[clamped]
    if (nextValue !== undefined && nextValue !== value) onChange(nextValue)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startY: e.clientY, startIndex: index }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const delta = Math.round((drag.current.startY - e.clientY) / PX_PER_STEP)
    setIndex(drag.current.startIndex + delta)
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Partial<Record<string, number>> = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1,
      PageUp: 10,
      PageDown: -10,
    }
    const move = moves[e.key]
    if (move !== undefined) {
      e.preventDefault()
      setIndex(index + move)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const fraction = steps.length > 1 ? index / (steps.length - 1) : 0
  const display = formatFieldValue(field, value)

  return (
    <div
      className={`${styles.sheet} tone-${meta.tone}`}
      role="dialog"
      aria-modal="true"
      aria-label={meta.label}
    >
      <header className={styles.header}>
        <h2 className={styles.label}>{meta.label}</h2>
        <p className={styles.value} aria-hidden="true">
          {display}
        </p>
      </header>

      <div
        className={styles.ruler}
        role="slider"
        tabIndex={0}
        aria-label={meta.label}
        aria-valuemin={steps[0]}
        aria-valuemax={steps.at(-1)}
        aria-valuenow={value}
        aria-valuetext={display}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className={styles.track} aria-hidden="true">
          <div className={styles.handle} style={{ bottom: `${fraction * 100}%` }} />
        </div>
        <p className={styles.hint}>Drag up or down</p>
      </div>

      <footer className={styles.footer}>
        <Button
          variant="round"
          aria-label="Decrease"
          onClick={() => {
            setIndex(index - 1)
          }}
        >
          <MinusIcon width={28} height={28} />
        </Button>
        <Button ref={doneRef} variant="secondary" className={styles.done} onClick={onClose}>
          Done
        </Button>
        <Button
          variant="round"
          aria-label="Increase"
          onClick={() => {
            setIndex(index + 1)
          }}
        >
          <PlusIcon width={28} height={28} />
        </Button>
      </footer>
    </div>
  )
}
