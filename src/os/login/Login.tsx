// Blue welcome screen with a single account tile. Asks for a name until one is saved: there is
// no default name, so the tile can't log on while the name is blank. Likewise asks Girl or Boy
// until a gender is saved (fresh visits and pre-v0.4 saves).
import { LanguagePicker } from '@/i18n/LanguagePicker';
import { usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { Wordmark } from '@/os/brand/Wordmark';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import type { Gender } from '@/os/types';
import { effectiveUserPicture } from '@/os/user/pictures';
import { userPictureSrc } from '@/os/user/sources';
import { GenderPicker } from './GenderPicker';
import styles from './Login.module.css';

export function Login() {
  const logOn = useSessionStore((s) => s.logOn);
  const savedName = usePlayerName();
  const firstVisit = !useSettingsStore((s) => s.firstBootDone);
  const askName = firstVisit || !savedName;
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);
  const markFirstBootDone = useSettingsStore((s) => s.markFirstBootDone);
  const savedGender = useSettingsStore((s) => s.gender);
  const setGender = useSettingsStore((s) => s.setGender);
  const askGender = askName || savedGender === null;
  const [pickedGender, setPickedGender] = useState<Gender | null>(null);
  const gender = pickedGender ?? savedGender;
  // While choosing, the tile previews the picked gender's default (unless a picture is saved).
  const picture = effectiveUserPicture(
    useSettingsStore((s) => s.userPicture),
    gender,
  );
  // null = untouched: the field shows the saved name (empty when there is none).
  const [edited, setDraft] = useState<string | null>(null);
  const draft = edited ?? savedName;
  const name = askName ? draft.trim() : savedName;
  const submitted = useRef(false);
  const t = useT();
  const locale = useLocale();
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (submitted.current || !name || !gender) return;
    submitted.current = true;
    if (askGender) setGender(gender);
    if (askName) {
      setPlayerName(name);
      markFirstBootDone();
    }
    logOn();
  }

  return (
    <div className={styles.login} data-testid="login-screen">
      <div className={styles.header}>
        <Wordmark edition />
      </div>
      <form className={styles.body} onSubmit={submit}>
        <div className={styles.prompt}>{t('login.prompt')}</div>
        <button
          type="submit"
          className={styles.tile}
          disabled={!name || !gender}
          aria-label={
            !name
              ? t('login.enterName')
              : gender
                ? t('login.logOnAs', { name })
                : t('login.genderMissing')
          }
        >
          <img
            src={userPictureSrc(picture)}
            alt=""
            width={48}
            height={48}
            data-picture={picture ?? 'none'}
          />
          <span className={name ? styles.name : styles.noName}>
            {name || t('login.enterName')}
          </span>
        </button>
        {askName && (
          <label className={styles.field}>
            {t('login.yourName')}
            <input
              autoFocus
              value={draft}
              maxLength={20}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
        )}
        {askGender && (
          <div className={styles.gender}>
            <span aria-hidden="true">{t('login.genderLabel')}</span>
            <GenderPicker
              label={t('login.genderLabel')}
              value={gender}
              onChange={setPickedGender}
              className={styles.languages}
              optionClassName={styles.languageOption}
            />
          </div>
        )}
        <div className={styles.language}>
          <span aria-hidden="true">{t('language.pickerLabel')}</span>
          <LanguagePicker
            label={t('language.pickerLabel')}
            value={locale}
            onChange={setLanguage}
            className={styles.languages}
            optionClassName={styles.languageOption}
          />
        </div>
      </form>
      <div className={styles.footer}>
        <span>{t('login.hint')}</span>
      </div>
    </div>
  );
}
