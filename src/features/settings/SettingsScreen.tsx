import { SOUND_SETS } from '@/services/audio'
import type { Settings } from '@/services/storage'
import { Button } from '@/ui/Button'
import { BackIcon, SoundIcon } from '@/ui/icons'
import styles from './SettingsScreen.module.css'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  /** Plays a short preview of the selected sound set. */
  onTestSound: () => void
  onBack: () => void
}

export function SettingsScreen({ settings, onChange, onTestSound, onBack }: Props) {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back to timer">
          <BackIcon />
        </button>
        <h1 className={styles.title}>Settings</h1>
        <span className={styles.back} aria-hidden="true" />
      </header>

      <section className={styles.card} aria-labelledby="sound-set-title">
        <h2 id="sound-set-title" className={styles.label}>
          Sounds
        </h2>
        <div className={styles.sets} role="radiogroup" aria-labelledby="sound-set-title">
          {SOUND_SETS.map((set) => (
            <label key={set.id} className={styles.set}>
              <input
                type="radio"
                name="sound-set"
                value={set.id}
                className={styles.radio}
                checked={settings.soundSet === set.id}
                onChange={() => {
                  onChange({ soundSet: set.id })
                }}
              />
              <span className={styles.setText}>
                <span className={styles.setName}>{set.name}</span>
                <span className={styles.help}>{set.description}</span>
              </span>
            </label>
          ))}
        </div>
        <Button variant="secondary" className={styles.test} onClick={onTestSound}>
          <SoundIcon /> Test sound
        </Button>
      </section>

      <section className={styles.card}>
        <label className={styles.row}>
          <span className={styles.label}>Play sounds in silent mode</span>
          <input
            type="checkbox"
            role="switch"
            className={styles.switch}
            checked={settings.playInSilentMode}
            onChange={(e) => {
              onChange({ playInSilentMode: e.target.checked })
            }}
          />
        </label>
        <p className={styles.help}>
          {settings.playInSilentMode
            ? 'On: you’ll hear the timer even in silent mode, but iPhone pauses music from other apps (like Spotify) when a sound plays.'
            : 'Off: the timer plays over your music without stopping it, but it’s silent while your iPhone is in silent mode.'}
        </p>
        <p className={styles.help}>
          iPhone doesn’t let web apps do both. Keep this off and turn silent mode off during
          workouts if you want music and beeps together.
        </p>
      </section>
    </main>
  )
}
