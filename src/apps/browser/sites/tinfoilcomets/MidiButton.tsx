// 🎵 "Play background MIDI": opt-in chiptune loop with Stop. Leaving the page stops the music.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useSiteText } from '../useSiteText';
import {
  isChiptunePlaying,
  playChiptune,
  stopChiptune,
  subscribeChiptune,
} from '@/os/chiptune';
import styles from './TinfoilComets.module.css';

export function MidiButton() {
  const { TINFOIL_SITE_TEXT: T } = useSiteText(TINFOIL_HOST);
  const playing = useSyncExternalStore(subscribeChiptune, isChiptunePlaying);
  const [muted, setMuted] = useState(false);
  useEffect(() => stopChiptune, []);
  return (
    <p className={styles.midi}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          if (playing) stopChiptune();
          else setMuted(!playChiptune());
        }}
      >
        <span aria-hidden>{playing ? '■ ' : '🎵 '}</span>
        {playing ? T.midiOff : T.midiOn}
      </button>
      {muted && !playing && (
        <span className={styles.small}> {T.midiMuted}</span>
      )}
    </p>
  );
}
