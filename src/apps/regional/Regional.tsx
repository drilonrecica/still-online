// Regional and Language Options: one "Languages" tab with a dropdown and a live example.
// Edits a draft; Apply/OK call `setLanguage`, Cancel closes without changing anything.
import { useEffect, useId, useState } from 'react';
import { formatNumber, formatShortDate, formatTime } from '@/i18n/format';
import { LanguageFlag } from '@/i18n/LanguageFlag';
import { LanguageSelect } from '@/i18n/LanguageSelect';
import { translate } from '@/i18n/t';
import { useLocale, useT } from '@/i18n/useT';
import { now } from '@/os/clock';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Regional.module.css';

export default function Regional({ windowId }: AppComponentProps) {
  const t = useT();
  const locale = useLocale();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const closeWindow = useWindowsStore((s) => s.closeWindow);
  const [draft, setDraft] = useState(locale);
  const selectId = useId();

  // The language can also change from the tray menu while this dialog is open.
  useEffect(() => setDraft(locale), [locale]);

  const dirty = draft !== locale;
  const date = now();
  const apply = () => dirty && setLanguage(draft);

  return (
    <div className={`${styles.root} touch-controls`}>
      <div role="tablist" className={styles.tabs}>
        <button type="button" role="tab" aria-selected="true">
          {t('language.regional.tab')}
        </button>
      </div>
      <div role="tabpanel" className={styles.panel}>
        <div className={styles.row}>
          <label htmlFor={selectId}>{t('language.regional.language')}</label>
          <LanguageFlag locale={draft} />
          <LanguageSelect
            id={selectId}
            className={styles.grow}
            value={draft}
            onChange={setDraft}
          />
        </div>
        <fieldset className={styles.example}>
          <legend>{t('language.regional.example')}</legend>
          <output data-testid="regional-preview">
            {translate(draft, 'language.regional.preview', {
              time: formatTime(date, draft),
              date: formatShortDate(date, draft),
              number: formatNumber(1234, draft),
            })}
          </output>
        </fieldset>
      </div>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => {
            apply();
            closeWindow(windowId);
          }}
        >
          {t('common.ok')}
        </button>
        <button type="button" onClick={() => closeWindow(windowId)}>
          {t('common.cancel')}
        </button>
        <button type="button" disabled={!dirty} onClick={apply}>
          {t('common.apply')}
        </button>
      </div>
    </div>
  );
}
