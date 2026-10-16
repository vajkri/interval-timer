import { useState, type SubmitEvent } from 'react'
import { PRESET_NAME_MAX_LENGTH, type Preset } from '@/domain/presets'
import { formatSeconds, workoutSeconds, type TimerConfig } from '@/domain/timer'
import { Button } from '@/ui/Button'
import { BackIcon, PlusIcon, TrashIcon } from '@/ui/icons'
import type { PresetsApi } from './usePresets'
import styles from './PresetsScreen.module.css'

interface Props {
  presets: PresetsApi
  currentConfig: TimerConfig
  onSelect: (preset: Preset) => void
  onBack: () => void
}

const summary = (c: TimerConfig) =>
  `${formatSeconds(c.workSec)} work · ${formatSeconds(c.restSec)} rest · ${c.exercises} × ${c.rounds}`

export function PresetsScreen({ presets, currentConfig, onSelect, onBack }: Props) {
  const [name, setName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const alreadySaved = presets.containsConfig(currentConfig)

  const save = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    presets.save(name, currentConfig)
    setName('')
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back to timer">
          <BackIcon />
        </button>
        <h1 className={styles.title}>Presets</h1>
        <span className={styles.back} aria-hidden="true" />
      </header>

      {!alreadySaved && (
        <form className={styles.save} onSubmit={save}>
          <label htmlFor="new-preset" className="visually-hidden">
            Name for the current timer
          </label>
          <input
            id="new-preset"
            className={styles.input}
            value={name}
            maxLength={PRESET_NAME_MAX_LENGTH}
            placeholder="Save current timer as…"
            autoComplete="off"
            enterKeyHint="done"
            onChange={(e) => {
              setName(e.target.value)
            }}
          />
          <Button type="submit" variant="secondary" aria-label="Save current timer as preset">
            <PlusIcon />
          </Button>
        </form>
      )}

      {presets.list.length === 0 ? (
        <p className={styles.empty}>No presets yet. Set up a timer and save it here.</p>
      ) : (
        <ul className={styles.list}>
          {presets.list.map((preset) => (
            <li key={preset.id} className={styles.item}>
              <button
                type="button"
                className={styles.select}
                onClick={() => {
                  onSelect(preset)
                }}
              >
                <span className={styles.name}>{preset.name}</span>
                <span className={styles.meta}>{summary(preset.config)}</span>
                <span className={styles.total}>{formatSeconds(workoutSeconds(preset.config))}</span>
              </button>
              {confirmDelete === preset.id ? (
                <Button
                  variant="primary"
                  className={styles.delete}
                  onClick={() => {
                    presets.remove(preset.id)
                    setConfirmDelete(null)
                  }}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className={styles.delete}
                  aria-label={`Delete ${preset.name}`}
                  onClick={() => {
                    setConfirmDelete(preset.id)
                  }}
                >
                  <TrashIcon />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
