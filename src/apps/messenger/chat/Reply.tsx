// Player replies: scripted choice buttons fill the input; Send (or Enter) sends the picked one.
import { useMemo, useRef, useState } from 'react';
import type { ContactId } from '@/content/types';
import { getMessengerEngine } from '../runtime';
import { useMessengerStore } from '../store';
import styles from './Chat.module.css';
import { EmoticonPicker } from './EmoticonPicker';

export function Reply({
  contactId,
  disabled,
}: {
  contactId: ContactId;
  disabled: boolean;
}) {
  const active = useMessengerStore(
    (s) => s.progress.contacts[contactId]?.active ?? null,
  );
  const choices = useMemo(
    () =>
      !disabled && active?.awaitingChoice
        ? getMessengerEngine().getChoices(contactId)
        : null,
    [disabled, active, contactId],
  );

  // A pick only counts for the choice set it was made in.
  const choiceKey = active ? `${active.scriptId}/${active.nodeId}` : '';
  const [picked, setPicked] = useState<{ key: string; index: number } | null>(
    null,
  );
  // Emoticon codes the player adds to the picked reply; sent with it.
  const [flavor, setFlavor] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const index = choices && picked?.key === choiceKey ? picked.index : null;
  const choice = index === null ? undefined : choices?.[index];

  function send() {
    if (index === null) return;
    if (getMessengerEngine().choose(contactId, index, flavor)) {
      setPicked(null);
      setFlavor('');
    }
  }

  return (
    <div className={styles.reply}>
      {choices && (
        <div className={styles.choices} role="group" aria-label="Replies">
          {choices.map((c, i) => (
            <button
              key={i}
              type="button"
              className={styles.choice}
              aria-pressed={i === index}
              title={c.text}
              onClick={() => {
                setPicked({ key: choiceKey, index: i });
                input.current?.focus();
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <form
        className={styles.compose}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <EmoticonPicker
          disabled={disabled}
          onPick={(code) => setFlavor((f) => (f ? `${f} ${code}` : code))}
        />
        <input
          ref={input}
          className={styles.input}
          aria-label="Message"
          readOnly
          disabled={disabled}
          value={choice ? [choice.text, flavor].filter(Boolean).join(' ') : ''}
          placeholder={choices ? 'Pick a reply above, then press Send.' : ''}
          onKeyDown={(e) => {
            // Explicit: implicit form submission from a read-only field varies by browser.
            if (e.key !== 'Enter') return;
            e.preventDefault();
            send();
          }}
        />
        <button type="submit" className={styles.send} disabled={!choice}>
          Send
        </button>
      </form>
    </div>
  );
}
