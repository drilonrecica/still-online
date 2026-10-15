import { APP_NAME } from '@/os/brand/brand';
import { Wordmark } from '@/os/brand/Wordmark';
import { resetStillOnline } from './reset';

const CREDITS_URL =
  'https://github.com/drilonrecica/still-online/blob/master/CREDITS.md';

export default function MyComputer() {
  async function reset() {
    if (!window.confirm(`Reset ${APP_NAME}? All saved data will be erased.`))
      return;
    await resetStillOnline(window.localStorage);
    window.location.reload();
  }

  return (
    <div
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
      <p>
        A browser-based nostalgia simulator recreating Windows XP and the social
        internet of 2007: a lived-in desktop, frozen somewhere in that year.
      </p>
      <p>
        {APP_NAME} is a fan-made, non-commercial nostalgia project. It is{' '}
        <strong>not</strong> affiliated with, endorsed by, or sponsored by
        Microsoft, MySpace, Netlog, Winamp, or any of their owners. All product
        names, logos and trademarks belong to their respective owners and are
        mentioned only to describe the era the project recreates. All
        characters, conversations and content inside the simulation are
        fictional.
      </p>
      <p>
        <a href={CREDITS_URL} target="_blank" rel="noreferrer">
          Credits
        </a>
      </p>
      <button type="button" onClick={() => void reset()}>
        Reset {APP_NAME}…
      </button>
    </div>
  );
}
