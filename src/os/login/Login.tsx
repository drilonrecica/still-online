// Blue welcome screen with a single account tile. First visit asks for a name.
import { LanguageSelect } from '@/i18n/LanguageSelect';
import { usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { Wordmark } from '@/os/brand/Wordmark';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import avatar from '@/os/startmenu/avatar.svg';
import styles from './Login.module.css';

export function Login() {
  const logOn = useSessionStore((s) => s.logOn);
  const savedName = usePlayerName();
  const firstVisit = !useSettingsStore((s) => s.firstBootDone);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);
  const markFirstBootDone = useSettingsStore((s) => s.markFirstBootDone);
  // null = untouched: the field shows the saved (or localized default) name.
  const [edited, setDraft] = useState<string | null>(null);
  const draft = edited ?? savedName;
  const submitted = useRef(false);
  const t = useT();
  const locale = useLocale();
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    if (firstVisit) {
      setPlayerName(draft.trim() || savedName);
      markFirstBootDone();
    }
    logOn();
  }

  const name = firstVisit ? draft.trim() || savedName : savedName;

  return (
    <div className={styles.login} data-testid="login-screen">
      <div className={styles.header}>
        <Wordmark edition />
      </div>
      <form className={styles.body} onSubmit={submit}>
        <div className={styles.prompt}>To begin, click your user name</div>
        <button
          type="submit"
          className={styles.tile}
          aria-label={`Log on as ${name}`}
        >
          <img src={avatar} alt="" width={48} height={48} />
          <span className={styles.name}>{name}</span>
        </button>
        {firstVisit && (
          <label className={styles.field}>
            Your name
            <input
              autoFocus
              value={draft}
              maxLength={20}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
        )}
      </form>
      <div className={styles.footer}>
        <span>After you log on, you can start chatting.</span>
        <label className={styles.language}>
          {t('language.pickerLabel')}
          <LanguageSelect value={locale} onChange={setLanguage} />
        </label>
      </div>
    </div>
  );
}
