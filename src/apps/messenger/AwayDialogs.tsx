// Two small in-window dialogs: the Away-message prompt and Options (auto-away settings).
import { getAwayMessage } from '@/i18n/settingsText';
import { useT } from '@/i18n/useT';
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
  const t = useT();
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
          <button type="submit">{t('common.ok')}</button>
          <button type="button" onClick={onCancel}>
            {t('common.cancel')}
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
  const t = useT();
  const [message, setMessage] = useState(() => getAwayMessage());
  return (
    <Dialog
      title={t('messenger.dialogs.awayTitle')}
      onSubmit={() => onConfirm(message.trim())}
      onCancel={onCancel}
    >
      <label className={styles.field}>
        {t('messenger.dialogs.awayPrompt')}
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
  const t = useT();
  const settings = useSettingsStore.getState();
  const [minutes, setMinutes] = useState(String(settings.awayMinutes));
  const [message, setMessage] = useState(getAwayMessage);
  return (
    <Dialog
      title={t('messenger.dialogs.optionsTitle')}
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
        {t('messenger.dialogs.awayMinutes')}
        <input
          type="number"
          min={0}
          max={MAX_AWAY_MINUTES}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        {t('messenger.dialogs.awayMessage')}
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
