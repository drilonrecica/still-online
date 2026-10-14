// Conversation transcript in the classic "<name> says:" + indented line format.
import { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '@/content/types';
import styles from './Chat.module.css';
import { parseEmoticons } from './emoticons';

/** Text with emoticon codes replaced by their pictures (the code stays as alt text). */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseEmoticons(text).map((s, i) =>
        s.kind === 'text' ? (
          <span key={i}>{s.text}</span>
        ) : (
          <img
            key={i}
            className={styles.emoticon}
            src={s.emoticon.src}
            alt={s.code}
            title={s.emoticon.name}
            width={19}
            height={19}
          />
        ),
      )}
    </>
  );
}

export function Transcript({
  entries,
  contactName,
  playerName,
}: {
  entries: readonly TranscriptEntry[];
  contactName: string;
  playerName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  return (
    <div
      ref={ref}
      className={styles.transcript}
      role="log"
      aria-label="Conversation"
      tabIndex={0}
    >
      {entries.map((entry, i) => {
        if (entry.kind === 'nudge')
          return (
            <p key={i} className={styles.nudgeLine}>
              {entry.from === 'contact' ? (
                <>
                  <RichText text={contactName} /> just sent you a nudge!
                </>
              ) : (
                'You have just sent a nudge!'
              )}
            </p>
          );
        const name = entry.from === 'contact' ? contactName : playerName;
        return (
          <div key={i} className={styles.message} data-from={entry.from}>
            <div className={styles.says}>
              <RichText text={name} /> says:
            </div>
            <div className={styles.line}>
              <RichText text={entry.text} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
