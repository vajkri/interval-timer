import { useState, type SubmitEvent } from 'react'
import { PRESET_NAME_MAX_LENGTH } from '@/domain/presets'
import { formatSeconds, workoutSeconds, type TimerConfig } from '@/domain/timer'
import { Button } from '@/ui/Button'
import { BoltIcon, CheckIcon, ClockIcon, RepeatIcon } from '@/ui/icons'
import styles from './CompleteScreen.module.css'

interface Props {
  config: TimerConfig
  isSavedPreset: boolean
  onSavePreset: (name: string) => void
  onRepeat: () => void
  onDone: () => void
}

export function CompleteScreen({ config, isSavedPreset, onSavePreset, onRepeat, onDone }: Props) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(isSavedPreset)

  const save = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSavePreset(name)
    setSaved(true)
  }

  return (
    <main className={styles.screen}>
      <header className={styles.hero}>
        <div className={styles.badge}>
          <CheckIcon width={56} height={56} strokeWidth={3} />
        </div>
        <h1 className={styles.title}>Workout complete</h1>
      </header>

      <dl className={styles.stats}>
        <div className="tone-work">
          <BoltIcon />
          <dt>Intervals</dt>
          <dd>{config.exercises * config.rounds}</dd>
        </div>
        <div className="tone-rounds">
          <RepeatIcon />
          <dt>Rounds</dt>
          <dd>{config.rounds}</dd>
        </div>
        <div className="tone-roundReset">
          <ClockIcon />
          <dt>Workout time</dt>
          <dd>{formatSeconds(workoutSeconds(config))}</dd>
        </div>
      </dl>

      {saved ? (
        <p className={styles.savedNote}>Saved in your presets.</p>
      ) : (
        <form className={styles.save} onSubmit={save}>
          <label htmlFor="preset-name" className={styles.saveLabel}>
            Save this workout as a preset
          </label>
          <div className={styles.saveRow}>
            <input
              id="preset-name"
              className={styles.input}
              value={name}
              maxLength={PRESET_NAME_MAX_LENGTH}
              placeholder="e.g. Morning HIIT"
              autoComplete="off"
              enterKeyHint="done"
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
            <Button type="submit" variant="secondary">
              Save
            </Button>
          </div>
        </form>
      )}

      <footer className={styles.actions}>
        <Button variant="secondary" onClick={onRepeat}>
          Repeat
        </Button>
        <Button onClick={onDone}>Done</Button>
      </footer>
    </main>
  )
}
