// TuneMole: search a fictional peer network, watch slow downloads, play what finished.
// Needs a connection; the state machine lives in `./store`.
import { useEffect, useMemo, useState } from 'react';
import { getTuneMoleResults } from '@/content/locale';
import { searchTuneMole } from '@/content/tunemole';
import type { TuneMoleResult } from '@/content/types';
import type { MessageKey } from '@/i18n/types';
import { formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/useT';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { requireOnline, useNetworkStore } from '@/os/network';
import { playSound } from '@/os/sound';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './TuneMole.module.css';
import { formatEta, STATUS_KEY, useTuneMoleStore } from './store';

export const APP_NAME = 'TuneMole';
export const PEER_COUNT = 1337;

type Tab = 'search' | 'downloads' | 'library';
const TABS: readonly { id: Tab; labelKey: MessageKey }[] = [
  { id: 'search', labelKey: 'tunemole.tabs.search' },
  { id: 'downloads', labelKey: 'tunemole.tabs.downloads' },
  { id: 'library', labelKey: 'tunemole.tabs.library' },
];

function Mascot() {
  const t = useT();
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      role="img"
      aria-label={t('tunemole.mascot')}
    >
      <circle cx="7" cy="8" r="4" fill="#5fae3c" stroke="#2f6a1c" />
      <circle cx="25" cy="8" r="4" fill="#5fae3c" stroke="#2f6a1c" />
      <ellipse
        cx="16"
        cy="18"
        rx="13"
        ry="11"
        fill="#7ccf50"
        stroke="#2f6a1c"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="15" r="2.4" fill="#fff" />
      <circle cx="21" cy="15" r="2.4" fill="#fff" />
      <circle cx="11.4" cy="15.4" r="1.1" fill="#222" />
      <circle cx="20.6" cy="15.4" r="1.1" fill="#222" />
      <ellipse
        cx="16"
        cy="21"
        rx="3.2"
        ry="2.2"
        fill="#f4a6b8"
        stroke="#8a3d54"
      />
    </svg>
  );
}

function SearchTab({ online }: { online: boolean }) {
  const t = useT();
  const [text, setText] = useState('');
  const [query, setQuery] = useState<string | null>(null);
  const locale = useLocale();
  const results = useMemo(
    () =>
      query === null ? [] : searchTuneMole(query, getTuneMoleResults(locale)),
    [query, locale],
  );

  const download = async (r: TuneMoleResult) => {
    if (!(await requireOnline())) return;
    useTuneMoleStore.getState().start(r);
  };

  return (
    <>
      <form
        className={styles.searchBar}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (online) setQuery(text);
          else void requireOnline().then((ok) => ok && setQuery(text));
        }}
      >
        <input
          aria-label={t('tunemole.search.label')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">{t('tunemole.search.submit')}</button>
      </form>
      {query === null ? (
        <p className={styles.empty}>{t('tunemole.search.hint')}</p>
      ) : results.length === 0 ? (
        <p className={styles.empty}>{t('tunemole.search.none', { query })}</p>
      ) : (
        <table
          className={styles.table}
          aria-label={t('tunemole.search.results')}
        >
          <thead>
            <tr>
              <th>{t('tunemole.search.fileName')}</th>
              <th>{t('tunemole.search.size')}</th>
              <th>{t('tunemole.search.bitrate')}</th>
              <th>{t('tunemole.search.peer')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={`${r.fileName}|${r.peer}`}>
                <td>{r.fileName}</td>
                <td>{(r.sizeKb / 1024).toFixed(1)} MB</td>
                <td>{r.bitrate} kbps</td>
                <td>{r.peer}</td>
                <td>
                  <button
                    type="button"
                    aria-label={t('tunemole.search.downloadFile', {
                      name: r.fileName,
                    })}
                    onClick={() => void download(r)}
                  >
                    {t('tunemole.search.download')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function DownloadsTab() {
  const t = useT();
  const downloads = useTuneMoleStore((s) => s.downloads);
  if (downloads.length === 0)
    return <p className={styles.empty}>{t('tunemole.downloads.empty')}</p>;
  return (
    <table className={styles.table} aria-label={t('tunemole.downloads.label')}>
      <thead>
        <tr>
          <th>{t('tunemole.downloads.fileName')}</th>
          <th>{t('tunemole.downloads.status')}</th>
          <th>{t('tunemole.downloads.progress')}</th>
          <th>{t('tunemole.downloads.speed')}</th>
          <th>{t('tunemole.downloads.eta')}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {downloads.map((d) => (
          <tr key={d.id}>
            <td>{d.result.fileName}</td>
            <td>{t(STATUS_KEY[d.status])}</td>
            <td>
              <div
                className={styles.progress}
                role="progressbar"
                aria-label={t('tunemole.downloads.progressOf', {
                  name: d.result.fileName,
                })}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(d.progress * 100)}
              >
                <span style={{ width: `${Math.round(d.progress * 100)}%` }} />
              </div>
            </td>
            <td>
              {d.status === 'downloading' ? `${d.kbps.toFixed(1)} KB/s` : '—'}
            </td>
            <td>{d.status === 'downloading' ? formatEta(d.etaSec) : '—'}</td>
            <td>
              <button
                type="button"
                aria-label={t(
                  d.status === 'done'
                    ? 'tunemole.downloads.clearFile'
                    : 'tunemole.downloads.cancelFile',
                  { name: d.result.fileName },
                )}
                onClick={() => useTuneMoleStore.getState().remove(d.id)}
              >
                {d.status === 'done'
                  ? t('tunemole.downloads.clear')
                  : t('tunemole.downloads.cancel')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LibraryTab() {
  const t = useT();
  const nodes = useFsStore((s) => s.nodes);
  const files = useMemo(
    () => useFsStore.getState().list(FS_FOLDERS.music),
    // `nodes` changes whenever the fs does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes],
  );
  if (files.length === 0)
    return <p className={styles.empty}>{t('tunemole.library.empty')}</p>;

  const open = (id: string) => {
    const node = useFsStore.getState().get(id);
    if (!node) return;
    if (node.type === 'audio' && node.trackId) {
      events.emit('amplifier:enqueue', { trackId: node.trackId, play: true });
    } else if (node.type === 'txt') {
      // A "song" that was really a joke: the peer's note, with a fitting sound.
      useWindowsStore.getState().openApp('notepad', { fileId: id });
      playSound('error');
    }
  };

  return (
    <table className={styles.table} aria-label={t('tunemole.library.label')}>
      <thead>
        <tr>
          <th>{t('tunemole.library.fileName')}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {files.map((f) => (
          <tr key={f.id}>
            <td>{f.name}</td>
            <td>
              <button
                type="button"
                aria-label={t('tunemole.library.playFile', { name: f.name })}
                onClick={() => open(f.id)}
              >
                {t('tunemole.library.play')}
              </button>{' '}
              <button
                type="button"
                aria-label={t('tunemole.library.showFile', { name: f.name })}
                onClick={() =>
                  useWindowsStore
                    .getState()
                    .openApp('explorer', { folder: FS_FOLDERS.music })
                }
              >
                {t('tunemole.library.showInFolder')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TuneMole({ windowId }: AppComponentProps) {
  const t = useT();
  const locale = useLocale();
  const online = useNetworkStore((s) => s.status === 'online');
  const [tab, setTab] = useState<Tab>('search');

  useEffect(() => {
    useWindowsStore.getState().setWindowTitle(windowId, 'apps.tunemole.title');
    if (useNetworkStore.getState().status !== 'online') void requireOnline();
  }, [windowId]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Mascot />
        <h1>{APP_NAME}</h1>
        <span className={styles.status} role="status">
          {online
            ? t('tunemole.connected', {
                peers: formatNumber(PEER_COUNT, locale),
              })
            : t('tunemole.notConnected')}
        </span>
      </div>
      {!online && (
        <div className={styles.offline}>
          <span>{t('tunemole.needConnection')}</span>
          <button type="button" onClick={() => void requireOnline()}>
            {t('tunemole.connect')}
          </button>
        </div>
      )}
      <div
        className={styles.tabs}
        role="tablist"
        aria-label={t('tunemole.tabs.label')}
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel">
        {tab === 'search' && <SearchTab online={online} />}
        {tab === 'downloads' && <DownloadsTab />}
        {tab === 'library' && <LibraryTab />}
      </div>
    </div>
  );
}
