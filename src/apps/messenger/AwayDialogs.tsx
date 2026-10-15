// Two small in-window dialogs: the Away-message prompt and Options (auto-away settings).
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import {
  MAX_AWAY_MESSAGE,
  MAX_AWAY_MINUTES,
  useSettingsStore,
} from '@/os/store/settings';
import styles from './Messenger.module.css';

export function Dialog({
  title,
  onSubmit,
  onCancel,
  children,
}: {
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <div className={styles.scrim}>
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      >
        <div id={titleId} className={styles.dialogTitle}>
          {title}
        </div>
        {children}
        <div className={styles.dialogButtons}>
          <button type="submit">OK</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/** Asked when the player picks Away by hand; the message is optional. */
export function AwayPrompt({
  onConfirm,
  onCancel,
}: {
  onConfirm: (message: string) => void;
  onCancel: () => void;
}) {
  const [message, setMessage] = useState(
    () => useSettingsStore.getState().awayMessage,
  );
  return (
    <Dialog
      title="Away message"
      onSubmit={() => onConfirm(message.trim())}
      onCancel={onCancel}
    >
      <label className={styles.field}>
        Show this message while you&apos;re away:
        <input
          type="text"
          autoFocus
          maxLength={MAX_AWAY_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
    </Dialog>
  );
}

export function OptionsDialog({ onClose }: { onClose: () => void }) {
  const settings = useSettingsStore.getState();
  const [minutes, setMinutes] = useState(String(settings.awayMinutes));
  const [message, setMessage] = useState(settings.awayMessage);
  return (
    <Dialog
      title="Options"
      onCancel={onClose}
      onSubmit={() => {
        const n = Number(minutes);
        const { setAwayMinutes, setAwayMessage } = useSettingsStore.getState();
        if (minutes.trim() !== '' && Number.isFinite(n)) setAwayMinutes(n);
        setAwayMessage(message);
        onClose();
      }}
    >
      <label className={styles.field}>
        Show me as Away after this many idle minutes (0 = never):
        <input
          type="number"
          min={0}
          max={MAX_AWAY_MINUTES}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Away message:
        <input
          type="text"
          maxLength={MAX_AWAY_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
    </Dialog>
  );
}
