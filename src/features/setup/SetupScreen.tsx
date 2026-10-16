import { useState } from 'react'
import { formatSeconds, workoutSeconds, type TimerConfig, type TimerField } from '@/domain/timer'
import { FIELD_META, FIELD_ORDER } from '@/ui/fields'
import { ListIcon, PlayIcon } from '@/ui/icons'
import { formatFieldValue } from './formatFieldValue'
import { ValuePicker } from './ValuePicker'
import styles from './SetupScreen.module.css'

interface Props {
  config: TimerConfig
  onChange: (config: TimerConfig) => void
  onStart: () => void
  onOpenPresets: () => void
}

export function SetupScreen({ config, onChange, onStart, onOpenPresets }: Props) {
  const [editing, setEditing] = useState<TimerField | null>(null)

  return (
    <main className={styles.screen}>
      <header className={styles.hero}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenPresets}
            aria-label="Presets"
          >
            <ListIcon />
          </button>
          <h1 className={styles.title}>Interval Timer</h1>
          <span className={styles.iconButton} aria-hidden="true" />
        </div>
        <p className={styles.total} aria-label="Total workout time">
          {formatSeconds(workoutSeconds(config))}
        </p>
      </header>

      <div className={styles.startWrap}>
        <button type="button" className={styles.start} onClick={onStart} aria-label="Start workout">
          <PlayIcon width={40} height={40} />
        </button>
      </div>

      <ul className={styles.rows}>
        {FIELD_ORDER.map((field) => {
          const meta = FIELD_META[field]
          return (
            <li key={field}>
              <button
                type="button"
                className={`${styles.row} tone-${meta.tone}`}
                onClick={() => {
                  setEditing(field)
                }}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.label}>{meta.label}</span>
                <span className={styles.value}>{formatFieldValue(field, config[field])}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {editing && (
        <ValuePicker
          field={editing}
          value={config[editing]}
          onChange={(value) => {
            onChange({ ...config, [editing]: value })
          }}
          onClose={() => {
            setEditing(null)
          }}
        />
      )}
    </main>
  )
}
