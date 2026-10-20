import { useT } from '@/i18n/useT';
import { APP_NAME } from '@/os/brand/brand';
import { Wordmark } from '@/os/brand/Wordmark';
import { resetStillOnline } from './reset';

const CREDITS_URL =
  'https://github.com/drilonrecica/still-online/blob/master/CREDITS.md';

export default function MyComputer() {
  const t = useT();
  async function reset() {
    if (!window.confirm(t('mycomputer.confirmReset', { app: APP_NAME })))
      return;
    await resetStillOnline(window.localStorage);
    window.location.reload();
  }

  return (
    <div
      className="touch-controls"
      style={{
        padding: 12,
        background: '#fff',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      <h1 style={{ margin: '0 0 8px' }} aria-label={APP_NAME}>
        <Wordmark size="sm" tagline />
      </h1>
      <p>{t('mycomputer.about')}</p>
      <p>
        {t('mycomputer.disclaimerBefore', { app: APP_NAME })}
        <strong>{t('mycomputer.disclaimerNot')}</strong>
        {t('mycomputer.disclaimerAfter')}
      </p>
      <p>
        <a href={CREDITS_URL} target="_blank" rel="noreferrer">
          {t('mycomputer.credits')}
        </a>
      </p>
      <button type="button" onClick={() => void reset()}>
        {t('mycomputer.reset', { app: APP_NAME })}
      </button>
    </div>
  );
}
