// Conversation transcript in the classic "<name> says:" + indented line format.
import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import { useT } from '@/i18n/useT';
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
  const t = useT();
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
            title={
              s.emoticon.nameKey ? t(s.emoticon.nameKey) : s.emoticon.codes[0]
            }
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

/** Renders a `{name}` template with `name` as a node (the name may carry emoticons or links). */
function withName(template: string, name: ReactNode): ReactNode {
  const [before = '', ...rest] = template.split('{name}');
  return (
    <>
      {before}
      {rest.map((part, i) => (
        <Fragment key={i}>
          {name}
          {part}
        </Fragment>
      ))}
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
  const t = useT();
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
      aria-label={t('messenger.chat.transcript')}
      tabIndex={0}
    >
      {entries.map((entry, i) => {
        if (entry.kind === 'nudge')
          return (
            <p key={i} className={styles.nudgeLine}>
              {entry.from === 'contact'
                ? withName(
                    t('messenger.transcript.nudgeFromContact', {
                      name: '{name}',
                    }),
                    <RichText text={contactName} />,
                  )
                : t('messenger.transcript.nudgeFromYou')}
            </p>
          );
        if (entry.kind === 'wink')
          return (
            <p key={i} className={styles.nudgeLine}>
              {entry.from === 'contact'
                ? withName(
                    t('messenger.transcript.winkFromContact', {
                      name: '{name}',
                      wink: t(WINKS[entry.wink].nameKey),
                    }),
                    <RichText text={contactName} />,
                  )
                : t('messenger.transcript.winkFromYou', {
                    wink: t(WINKS[entry.wink].nameKey),
                  })}
            </p>
          );
        const name = entry.from === 'contact' ? contactName : playerName;
        return (
          <div key={i} className={styles.message} data-from={entry.from}>
            <div className={styles.says}>
              {withName(
                t('messenger.transcript.says', { name: '{name}' }),
                <RichText text={name} />,
              )}
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
