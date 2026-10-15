// Web Explorer (app `browser`): IE6-style chrome around the fictional `.example` web.
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useLocale, useT } from '@/i18n/useT';
import { requireOnline } from '@/os/network';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Browser.module.css';
import { ErrorPage } from './ErrorPage';
import { FavoritesPane } from './FavoritesPane';
import {
  BackIcon,
  ForwardIcon,
  GlobeIcon,
  GoIcon,
  HomeIcon,
  PageIcon,
  RefreshIcon,
  StarIcon,
  StopIcon,
} from './icons';
import { MenuBar, type Menu, type MenuEntry } from './MenuBar';
import { NavigatorContext, type BrowserNavigator } from './navigator';
import { LoadProgress } from './LoadProgress';
import { resolve } from './sites';
import { renderFavorites, useWebStore } from './store';
import { useNavigation } from './useNavigation';

export const APP_NAME = 'Web Explorer';

export default function Browser({ windowId, props }: AppComponentProps) {
  const nav = useNavigation(
    typeof props.url === 'string' ? props.url : undefined,
  );
  const [address, setAddress] = useState(nav.url);
  const [hovered, setHovered] = useState<string | null>(null);
  const [paneOpen, setPaneOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const favoriteRecords = useWebStore((s) => s.favorites);
  const t = useT();
  const locale = useLocale();
  // Default favorites are named in the current language.
  const favorites = useMemo(
    () => renderFavorites(favoriteRecords, locale),
    [favoriteRecords, locale],
  );

  const shown = nav.shown;
  const page = useMemo(
    () => (shown && !shown.offline ? resolve(shown.url) : null),
    [shown],
  );
  const pageTitle = shown
    ? (page?.page.title ?? t('browser.cannotFindServer'))
    : null;

  // The address bar follows navigation; the window remembers the page for a restore.
  useEffect(() => {
    setAddress(nav.url);
    useWindowsStore.getState().setWindowProps(windowId, { url: nav.url });
  }, [nav.url, windowId]);

  useEffect(() => {
    const windows = useWindowsStore.getState();
    if (pageTitle)
      windows.setWindowTitle(windowId, 'browser.title', { page: pageTitle });
    else windows.setWindowTitle(windowId, 'apps.browser.title');
  }, [pageTitle, windowId]);

  const navigator: BrowserNavigator = useMemo(
    () => ({
      navigate: nav.follow,
      hover: setHovered,
      resolveHref: nav.resolveLink,
    }),
    [nav.follow, nav.resolveLink],
  );

  const isFavorite = favorites.some((f) => f.url === nav.url);
  const addCurrent = () => {
    if (pageTitle)
      useWebStore.getState().addFavorite({ title: pageTitle, url: nav.url });
  };

  const favoriteItems: MenuEntry[] = [
    {
      kind: 'item',
      label: 'Add to Favorites...',
      onSelect: addCurrent,
      disabled: !page,
    },
    {
      kind: 'item',
      label: 'Remove from Favorites',
      onSelect: () => useWebStore.getState().removeFavorite(nav.url),
      disabled: !isFavorite,
    },
    { kind: 'separator' },
    ...favorites.map((f): MenuEntry => ({
      kind: 'item',
      label: f.title,
      onSelect: () => nav.go(f.url),
    })),
  ];
  const menus: Menu[] = [
    { label: 'File', items: [] },
    { label: 'Edit', items: [] },
    { label: 'View', items: [] },
    { label: 'Favorites', items: favoriteItems },
    { label: 'Tools', items: [] },
    {
      label: 'Help',
      items: [
        {
          kind: 'item',
          label: 'About Web Explorer',
          onSelect: () => setAbout(true),
        },
      ],
    },
  ];

  const connect = async () => {
    if (await requireOnline()) nav.refresh();
  };

  const status =
    hovered ??
    (nav.loading ? `Opening page ${nav.loading.url}...` : shown ? 'Done' : '');

  let content = null;
  if (shown && page) {
    const Page = page.page.component;
    content = (
      <Suspense fallback={null}>
        <Page
          key={shown.id}
          path={page.path}
          query={page.query}
          navigate={nav.follow}
        />
      </Suspense>
    );
  } else if (shown) {
    content = (
      <ErrorPage url={shown.url} offline={shown.offline} onConnect={connect} />
    );
  }

  return (
    <div className={styles.root}>
      <MenuBar menus={menus} />

      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Standard Buttons"
      >
        <button
          type="button"
          className={styles.tool}
          onClick={nav.back}
          disabled={!nav.canBack}
          aria-label="Back"
        >
          <BackIcon />
          <span>Back</span>
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={nav.forward}
          disabled={!nav.canForward}
          aria-label="Forward"
        >
          <ForwardIcon />
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={nav.stop}
          disabled={!nav.loading}
          aria-label="Stop"
        >
          <StopIcon />
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={nav.refresh}
          aria-label="Refresh"
        >
          <RefreshIcon />
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={nav.home}
          aria-label="Home"
        >
          <HomeIcon />
        </button>
        <span className={styles.toolSep} aria-hidden="true" />
        <button
          type="button"
          className={styles.tool}
          onClick={() => setPaneOpen(!paneOpen)}
          aria-pressed={paneOpen}
          aria-label="Favorites"
        >
          <StarIcon />
          <span>Favorites</span>
        </button>
      </div>

      <form
        className={styles.addressBar}
        onSubmit={(e) => {
          e.preventDefault();
          nav.go(address);
        }}
      >
        <label htmlFor={`${windowId}-address`}>Address</label>
        <span className={styles.addressField}>
          <PageIcon />
          <input
            id={`${windowId}-address`}
            type="text"
            value={address}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setAddress(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </span>
        <button type="submit" className={styles.go}>
          <GoIcon />
          Go
        </button>
      </form>

      <div className={styles.body}>
        {paneOpen && (
          <FavoritesPane
            favorites={favorites}
            canAdd={Boolean(page)}
            onAdd={addCurrent}
            onOpen={nav.go}
            onRemove={(url) => useWebStore.getState().removeFavorite(url)}
            onClose={() => setPaneOpen(false)}
          />
        )}
        <div
          className={styles.viewport}
          data-testid="browser-viewport"
          aria-busy={Boolean(nav.loading)}
        >
          <NavigatorContext.Provider value={navigator}>
            {content}
          </NavigatorContext.Provider>
        </div>
      </div>

      <div className={styles.statusBar}>
        <span className={styles.statusText} role="status">
          {shown && !nav.loading && !hovered && <PageIcon />}
          {status}
        </span>
        <span className={styles.statusProgress}>
          {nav.loading && (
            <LoadProgress key={nav.loading.id} ms={nav.loading.ms} />
          )}
        </span>
        <span className={styles.zone}>
          <GlobeIcon />
          Internet
        </span>
      </div>

      {about && (
        <div className={styles.overlay}>
          <div
            className={`window ${styles.dialog}`}
            role="dialog"
            aria-label="About Web Explorer"
          >
            <div className="title-bar">
              <div className="title-bar-text">About Web Explorer</div>
            </div>
            <div className="window-body">
              <p>
                <b>Web Explorer</b> Version 6.0
                <br />
                still online, 2007
              </p>
              <p>Surfs every page of the fictional .example web.</p>
              <div className={styles.dialogButtons}>
                <button type="button" autoFocus onClick={() => setAbout(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
