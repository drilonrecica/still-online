// Web Explorer (app `browser`): IE6-style chrome around the fictional `.example` web.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { useDevice } from '@/os/device';
import { requireOnline } from '@/os/network';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Browser.module.css';
import { ErrorPage } from './ErrorPage';
import { FavoritesPane } from './FavoritesPane';
import { GlobeIcon, GoIcon, PageIcon } from './icons';
import { MenuBar, type Menu, type MenuEntry } from './MenuBar';
import { NavigatorContext, type BrowserNavigator } from './navigator';
import { LoadProgress } from './LoadProgress';
import { PageView } from './PageView';
import { pageTitle as sitePageTitle, resolve } from './sites';
import { renderFavorites, useWebStore } from './store';
import { Toolbar } from './Toolbar';
import { useNavigation } from './useNavigation';
import { isFitToScreen } from './zoom';

export const APP_NAME = 'Web Explorer';

export default function Browser({ windowId, props }: AppComponentProps) {
  const nav = useNavigation(
    typeof props.url === 'string' ? props.url : undefined,
  );
  const [address, setAddress] = useState(nav.url);
  const [hovered, setHovered] = useState<string | null>(null);
  // A finger has no hover: Chromium's compatibility mouse events would leave the address of
  // whatever link lands under the last tap stuck in the status bar, over „Done". Only a mouse
  // (or keyboard focus while using one) shows a link's address.
  const touching = useRef(false);
  const [paneOpen, setPaneOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const favoriteRecords = useWebStore((s) => s.favorites);
  const device = useDevice();
  const phone = device === 'phone';
  const fit = isFitToScreen(
    useWebStore((s) => s.fitToScreen),
    device,
  );
  const t = useT();
  const locale = useLocale();
  // Page titles come from site metadata, which resolves for the gender: re-render on a switch.
  const gender = useGender();
  // Untouched default favorites follow the gender and are named in the current language.
  const favorites = useMemo(
    () => renderFavorites(favoriteRecords, locale, gender),
    [favoriteRecords, locale, gender],
  );

  const shown = nav.shown;
  const page = useMemo(
    () => (shown && !shown.offline ? resolve(shown.url) : null),
    [shown],
  );
  const pageTitle = shown
    ? page
      ? sitePageTitle(page, locale)
      : t('browser.cannotFindServer')
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

  const viewport = useRef<HTMLDivElement>(null);
  const navigator: BrowserNavigator = useMemo(
    () => ({
      navigate: nav.follow,
      hover: (url) => {
        if (url === null || !touching.current) setHovered(url);
      },
      resolveHref: nav.resolveLink,
      scrollToTop: () => {
        if (viewport.current) viewport.current.scrollTop = 0;
      },
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
      label: t('browser.menu.addFavorite'),
      onSelect: addCurrent,
      disabled: !page,
    },
    {
      kind: 'item',
      label: t('browser.menu.removeFavorite'),
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
    { label: t('browser.menu.file'), items: [] },
    { label: t('browser.menu.edit'), items: [] },
    // View → Fit to screen / Actual size: pages only scale on a phone.
    {
      label: t('browser.menu.view'),
      items: phone
        ? [
            {
              kind: 'item',
              label: t('browser.menu.fitToScreen'),
              checked: fit,
              onSelect: () => useWebStore.getState().setFitToScreen(true),
            },
            {
              kind: 'item',
              label: t('browser.menu.actualSize'),
              checked: !fit,
              onSelect: () => useWebStore.getState().setFitToScreen(false),
            },
          ]
        : [],
    },
    { label: t('browser.menu.favorites'), items: favoriteItems },
    { label: t('browser.menu.tools'), items: [] },
    {
      label: t('browser.menu.help'),
      items: [
        {
          kind: 'item',
          label: t('browser.menu.aboutItem'),
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
    (nav.loading
      ? t('browser.status.opening', { url: nav.loading.url })
      : shown
        ? t('browser.status.done')
        : '');

  const favoritesPane = (
    <FavoritesPane
      favorites={favorites}
      canAdd={Boolean(page)}
      onAdd={addCurrent}
      onOpen={(url) => {
        if (phone) setPaneOpen(false);
        nav.go(url);
      }}
      onRemove={(url) => useWebStore.getState().removeFavorite(url)}
      onClose={() => setPaneOpen(false)}
    />
  );

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
    <div
      className={styles.root}
      onPointerDownCapture={(e) => {
        touching.current = e.pointerType === 'touch' || e.pointerType === 'pen';
        if (touching.current) setHovered(null);
      }}
      onPointerMoveCapture={(e) => {
        if (e.pointerType === 'mouse') touching.current = false;
      }}
    >
      <MenuBar menus={menus} />

      <Toolbar
        nav={nav}
        phone={phone}
        favoritesOpen={paneOpen}
        onToggleFavorites={() => setPaneOpen(!paneOpen)}
      />

      <form
        className={styles.addressBar}
        onSubmit={(e) => {
          e.preventDefault();
          nav.go(address);
        }}
      >
        <label htmlFor={`${windowId}-address`}>{t('browser.address')}</label>
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
          {t('browser.go')}
        </button>
      </form>

      <div className={styles.body}>
        {paneOpen && !phone && favoritesPane}
        <PageView
          viewportRef={viewport}
          virtual={phone}
          fit={fit}
          busy={Boolean(nav.loading)}
        >
          <NavigatorContext.Provider value={navigator}>
            {content}
          </NavigatorContext.Provider>
        </PageView>
        {/* Phone: the favorites are a sheet over the page; a tap beside it closes it. */}
        {paneOpen && phone && (
          <div
            className={styles.sheetBackdrop}
            data-testid="favorites-sheet"
            onClick={(e) => e.target === e.currentTarget && setPaneOpen(false)}
          >
            {favoritesPane}
          </div>
        )}
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
          {t('browser.status.zone')}
        </span>
      </div>

      {about && (
        <div className={styles.overlay}>
          <div
            className={`window ${styles.dialog}`}
            role="dialog"
            aria-label={t('browser.about.title')}
          >
            <div className="title-bar">
              <div className="title-bar-text">{t('browser.about.title')}</div>
            </div>
            <div className="window-body">
              <p>
                <b>{APP_NAME}</b> {t('browser.about.version')}
                <br />
                {t('browser.about.tagline')}
              </p>
              <p>{t('browser.about.blurb')}</p>
              <div className={styles.dialogButtons}>
                <button type="button" autoFocus onClick={() => setAbout(false)}>
                  {t('common.ok')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
