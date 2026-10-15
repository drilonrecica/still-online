// TuneMole: search a fictional peer network, watch slow downloads, play what finished.
// Needs a connection; the state machine lives in `./store`.
import { useEffect, useMemo, useState } from 'react';
import { searchTuneMole } from '@/content/tunemole';
import type { TuneMoleResult } from '@/content/types';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { requireOnline, useNetworkStore } from '@/os/network';
import { playSound } from '@/os/sound';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './TuneMole.module.css';
import { formatEta, STATUS_LABEL, useTuneMoleStore } from './store';

export const APP_NAME = 'TuneMole';
export const PEER_COUNT = '1,337';

type Tab = 'search' | 'downloads' | 'library';
const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'library', label: 'Library' },
];

function Mascot() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      role="img"
      aria-label="TuneMole mascot"
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
  const [text, setText] = useState('');
  const [query, setQuery] = useState<string | null>(null);
  const results = useMemo(
    () => (query === null ? [] : searchTuneMole(query)),
    [query],
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
          aria-label="Search for music"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {query === null ? (
        <p className={styles.empty}>Type a song or band and press Search.</p>
      ) : results.length === 0 ? (
        <p className={styles.empty}>
          No files found for “{query}”. Try fewer words.
        </p>
      ) : (
        <table className={styles.table} aria-label="Search results">
          <thead>
            <tr>
              <th>File name</th>
              <th>Size</th>
              <th>Bitrate</th>
              <th>Peer</th>
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
                    aria-label={`Download ${r.fileName}`}
                    onClick={() => void download(r)}
                  >
                    Download
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
  const downloads = useTuneMoleStore((s) => s.downloads);
  if (downloads.length === 0)
    return <p className={styles.empty}>No downloads yet. Search for a song!</p>;
  return (
    <table className={styles.table} aria-label="Downloads">
      <thead>
        <tr>
          <th>File name</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Speed</th>
          <th>ETA</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {downloads.map((d) => (
          <tr key={d.id}>
            <td>{d.result.fileName}</td>
            <td>{STATUS_LABEL[d.status]}</td>
            <td>
              <div
                className={styles.progress}
                role="progressbar"
                aria-label={`Progress of ${d.result.fileName}`}
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
                aria-label={`${d.status === 'done' ? 'Clear' : 'Cancel'} ${d.result.fileName}`}
                onClick={() => useTuneMoleStore.getState().remove(d.id)}
              >
                {d.status === 'done' ? 'Clear' : 'Cancel'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LibraryTab() {
  const nodes = useFsStore((s) => s.nodes);
  const files = useMemo(
    () => useFsStore.getState().list(FS_FOLDERS.music),
    // `nodes` changes whenever the fs does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes],
  );
  if (files.length === 0)
    return <p className={styles.empty}>Your library is empty.</p>;

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
    <table className={styles.table} aria-label="Library">
      <thead>
        <tr>
          <th>File name</th>
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
                aria-label={`Play ${f.name}`}
                onClick={() => open(f.id)}
              >
                Play
              </button>{' '}
              <button
                type="button"
                aria-label={`Show ${f.name} in folder`}
                onClick={() =>
                  useWindowsStore
                    .getState()
                    .openApp('explorer', { folder: FS_FOLDERS.music })
                }
              >
                Show in folder
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TuneMole({ windowId }: AppComponentProps) {
  const online = useNetworkStore((s) => s.status === 'online');
  const [tab, setTab] = useState<Tab>('search');

  useEffect(() => {
    useWindowsStore.getState().setWindowTitle(windowId, APP_NAME);
    if (useNetworkStore.getState().status !== 'online') void requireOnline();
  }, [windowId]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Mascot />
        <h1>TuneMole</h1>
        <span className={styles.status} role="status">
          {online ? `Connected to ${PEER_COUNT} peers` : 'Not connected'}
        </span>
      </div>
      {!online && (
        <div className={styles.offline}>
          <span>You need an Internet connection to find music.</span>
          <button type="button" onClick={() => void requireOnline()}>
            Connect
          </button>
        </div>
      )}
      <div className={styles.tabs} role="tablist" aria-label="TuneMole">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
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
