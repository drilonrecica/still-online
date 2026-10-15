// Conversation transcript in the classic "<name> says:" + indented line format.
import { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '@/content/types';
import styles from './Chat.module.css';
import { events } from '@/os/events';
import { splitLinks } from '@/os/linkify';
import { parseEmoticons } from './emoticons';
import { WINKS } from '../winks/catalog';
import { useMessengerStore } from '../store';
import { PictureFile } from './PlayerPicture';

/** Emoticon segments of `text` as images. */
function Emoticons({ text }: { text: string }) {
  const custom = useMessengerStore((s) => s.progress.player.customEmoticons);
  return (
    <>
      {parseEmoticons(text, custom).map((s, i) =>
        s.kind === 'text' ? (
          <span key={i}>{s.text}</span>
        ) : s.emoticon.fileId ? (
          <span
            key={i}
            className={styles.emoticon}
            role="img"
            aria-label={s.code}
            title={s.code}
          >
            <PictureFile fileId={s.emoticon.fileId} size={19} label="" />
          </span>
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

/** Text with `*.example` links as link-styled buttons (opening Web Explorer) and emoticon codes as pictures. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {splitLinks(text).map((s, i) =>
        s.kind === 'text' ? (
          <Emoticons key={i} text={s.text} />
        ) : (
          <button
            key={i}
            type="button"
            className={styles.link}
            onClick={() => events.emit('browser:open', { url: s.url })}
          >
            {s.text}
          </button>
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
        if (entry.kind === 'wink')
          return (
            <p key={i} className={styles.nudgeLine}>
              {entry.from === 'contact' ? (
                <>
                  <RichText text={contactName} /> sent you a wink:{' '}
                  {WINKS[entry.wink].name}
                </>
              ) : (
                `You sent a wink: ${WINKS[entry.wink].name}`
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
